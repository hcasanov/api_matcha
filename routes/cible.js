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

        if (req.headers.token == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(function (err, client, done) {
            var id = jwt_decode(req.headers.token).id;
            var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
            client.query(query, (err, result) => {
                if (err) {
                    done()
                    return res.status(500).send('Internal Server Error');
                }
                else if (result.rows[0] == undefined) {
                    done()
                    return res.status(401).send('Unauthorized');
                }
                else if (result.rows[0].token === req.headers.token) {
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
                                    var my_hashtags = result.rows[0].hashtags
                                    if (research_gender === 'M' || research_gender === 'F') {
                                        var query = "SELECT accounts.id FROM accounts LEFT JOIN likes ON accounts.id = likes.to_id WHERE (accounts.age BETWEEN " + research_age_min + " AND " + research_age_max + ") AND accounts.gender = \'" + research_gender + "\' AND accounts.research_gender = \'" + gender + "\' AND accounts.blocked = false AND accounts.id != " + id + " AND (likes.from_id != " + id + " OR likes.from_id IS NULL);"
                                    }
                                    else {
                                        var query = "SELECT accounts.id FROM accounts LEFT JOIN likes ON accounts.id = likes.to_id WHERE (accounts.age BETWEEN " + research_age_min + " AND " + research_age_max + ") AND accounts.research_gender = 'A' AND accounts.blocked = false AND accounts.id != " + id + " AND (likes.from_id != " + id + " OR likes.from_id IS NULL);"
                                    }
                                    client.query(query, async (err, result) => {
                                        if (err) {
                                            done()
                                            res.status(500).send('Internal Server Error')
                                        }
                                        else {
                                            var tab = result.rows
                                            for (const el in tab) {
                                                var select_hashtags = "SELECT hashtags FROM accounts WHERE id = " + tab[el].id + ";"
                                                var result = await client.query(select_hashtags)
                                                var score = await calc_score_match(result.rows[0].hashtags, my_hashtags)
                                                var id = tab[el].id

                                                tab[el] = ([
                                                    score= score,
                                                    id= id
                                                ])
                                            }
                                            if (tab[0] != undefined){
                                                await tab.sort()
                                                await tab.reverse()
                                                var list_id = ""
                                                for (const el in tab) {
                                                    if (el === 0)
                                                        list_id = list_id + tab[el][1] + "\,"
                                                    if (el != tab.length - 1)
                                                        list_id = list_id + " " + tab[el][1] + "\,"
                                                    else
                                                        list_id = list_id + " " + tab[el][1]
                                                }
                                                var select_user = "SELECT id, login, name, age, description, hashtags FROM accounts WHERE id IN (" + list_id + ");"
                                                client.query(select_user, async (err, result) => {
                                                    if (err)
                                                        return res.status(500).send('Internal Server Error')
                                                    return res.status(400).json(result.rows)
                                                })
                                            }
                                            else {
                                                return res.status(400).json({})  
                                            }
                                        }
                                    })
                                }
                            })
                        }
                        else
                            return res.status(401).send('Unauthorized');
                    })
                }
                else
                    return res.status(401).send('Unauthorized');
            })
        })
    }
}

async function calc_score_match(hashtags, my_hashtags) {
    if (hashtags != undefined && my_hashtags != undefined){
        var my_hashtags = my_hashtags.split(',')
        var hashtags = hashtags.split(',')
    
        var count_my_hashtags = my_hashtags.length
    
        var score = 0;
        
        my_hashtags.forEach(my_el => {
            hashtags.forEach(el => {
                if (my_el === el) {
                    score = score + (50 / count_my_hashtags)
                }
            })
        })
        return (score)
    } else
        return (0)
}