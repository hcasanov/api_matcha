const pg = require('pg');
const jwt_decode = require('jwt-decode');

const config = {
    user: process.env.SQL_USER,
    host: process.env.SQL_HOST,
    database: process.env.SQL_DATABASE,
    port: process.env.SQL_POT
};
const pool = new pg.Pool(config);

module.exports = {
    get: function (req, res) {
        pool.connect(function (err, client, done) {
            if (err){
                done()
                res.status(500).send('Internal Server Error')
            }
            else {
                var id = jwt_decode(req.body.token).id;
                var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
                client.query(query, (err, result) => {
                    if (err){
                        done()
                        return res.status(500).send('Internal Server Error');
                    }
                    else if (result == undefined){
                        done()
                        return res.status(401).send('Unauthorized');
                    }
                    else if (result.rows[0].token === req.body.token) {
                        var query = "Select * FROM accounts WHERE id = " + id + ";"
                        client.query(query, (err, result) => {
                            if (err){
                                done()
                                res.status(500).send('Internal Server Error')
                            }
                            else if (result.rows[0] == undefined){
                                done()
                                res.status(400).send('Bad Request')
                            }
                            else {
                                var research_age_min = result.rows[0].research_age_min
                                var research_age_max = result.rows[0].research_age_max
                                var research_gender = result.rows[0].research_gender
                                var gender = result.rows[0].gender
                                var id = result.rows[0].id
                                var query = "SELECT * FROM accounts \
                                            WHERE (age BETWEEN " + research_age_min + " AND " + research_age_max + ") \
                                            AND gender = \'" + research_gender + "\' AND research_gender = \'" + gender + "\' \
                                            AND blocked = false \
                                            AND id != " + id + ";"// QUERY ne prend pas en compte si la perosnne recherche tous les sexes, je n'ai pas voulu de faire 2 requetes avec un if research_gender = All
                                client.query(query, (err, result) => {
                                    if (err){
                                        done()
                                        res.status(500).send('Internal Server Error')
                                    }
                                    else {
                                        done()
                                        
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