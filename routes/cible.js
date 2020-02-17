const pg = require('pg');
const jwt_decode = require('jwt-decode');

const config = {
    user: process.env.SQL_USER,
    host: process.env.SQL_HOST,
    database: process.env.SQL_DATABASE,
    port: process.env.SQL_PORT
};
const pool = new pg.Pool(config);

module.exports = {
    get: function (req, res) {
        pool.connect(function (err, client, done) {
            if (err) {
                done()
                res.status(500).send('Internal Server Error')
            }
            else {
                var id = jwt_decode(req.headers.token).id;
                var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
                client.query(query, (err, result) => {
                    if (err) {
                        done()
                        return res.status(500).send('Internal Server Error');
                    }
                    else if (result == undefined) {
                        done()
                        return res.status(401).send('Unauthorized');
                    }
                    else if (result.rows[0].token === req.headers.token) {
                        var query = "Select * FROM accounts WHERE id = " + id + ";"
                        client.query(query, (err, result) => {
                            if (err) {
                                done()
                                res.status(500).send('Internal Server Error')
                            }
                            else if (result.rows[0] == undefined) {
                                done()
                                res.status(400).send('Bad Request')
                            }
                            else {
                                var research_age_min = result.rows[0].research_age_min
                                var research_age_max = result.rows[0].research_age_max
                                var research_gender = result.rows[0].research_gender
                                var gender = result.rows[0].gender
                                var id = result.rows[0].id
                                if (research_gender === 'M' || research_gender === 'F') {
                                    var query = "SELECT * FROM accounts LEFT JOIN likes ON accounts.id = likes.to_id WHERE (accounts.age BETWEEN " + research_age_min + " AND " + research_age_max + ") AND accounts.gender = \'" + research_gender + "\' AND accounts.research_gender = \'" + gender + "\' AND accounts.blocked = false;"
                                }
                                else {
                                    var query = "SELECT * FROM accounts \
                                            WHERE (age BETWEEN " + research_age_min + " AND " + research_age_max + ") \
                                            AND research_gender = 'A' \
                                            AND blocked = false \
                                            AND id != " + id + ";"
                                }
                                client.query(query, (err, result) => {
                                    if (err) {
                                        done()
                                        res.status(500).send('Internal Server Error')
                                    }
                                    else {
                                        done()
                                        var tab = [];
                                        console.log(result.rows)
                                        // result.rows.forEach(el => {
                                        //     console.log(el)
                                        //     // if(!tab.find(user => user.id === el.id))
                                        // })
                                        // console.log(result.rows)
                                        return res.json(result.rows)
                                    }
                                })
                            }
                        })
                    }
                    else
                        return res.status(401).send('Unauthorized');
                })
            }
        })
    }
}