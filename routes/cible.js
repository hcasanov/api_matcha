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
                                                    score = score,
                                                    id = id
                                                ])
                                            }
                                            if (tab[0] != undefined) {
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
                                                var select_user = "SELECT id, login, last_connection, online, name, firstname, age, description, hashtags FROM accounts WHERE id IN (" + list_id + ");"
                                                client.query(select_user, async (err, result) => {
                                                    if (err)
                                                        return res.status(500).send('Internal Server Error')
                                                    if (result.rows[0] === undefined)
                                                        return res.status(200).json([])
                                                    var tab_parse = []
                                                    if (result.rows[0] != undefined){

                                                        result.rows.forEach(el => {
                                                            var query_block = "SELECT id FROM block WHERE from_id = " + jwt_decode(req.headers.token).id + " AND to_id = " + el.id + ""
                                                            client.query(query_block, (err, response_block) => {
                                                                if (err){
                                                                    done()
                                                                    return res.status(500).send('Internal Server Error')
                                                                }
                                                                else if (response_block.rows == []){
                                                                    tab_parse.push(el)
                                                                }

                                                            })
                                                        })
                                                        // var tab = []
                                                        for (const i in result.rows){
                                                            var query_block = "SELECT id FROM block WHERE from_id = " + jwt_decode(req.headers.token).id + " AND to_id = " + result.rows[i].id + ""
                                                            client.query(query_block, (err, response_block) => {
                                                                if (err){
                                                                    done()
                                                                    return res.status(500).send('Internal Server Error')
                                                                }
                                                                else if (response_block.rows[0] != undefined){
                                                                    result.rows.splice(i, 1)
                                                                }
                                                            })
                                                        }
                                                    }
                                                    var response = []
                                                    for (const index in result.rows){

                                                        var query_picture = "SELECT url_picture, profile_picture FROM pictures WHERE id_account = " + result.rows[index].id + ";"
                                                        var query_location = "SELECT latitude, longitude FROM locations WHERE id = " + result.rows[index].id + ";"
                                                        var response_query = await client.query(query_picture)
                                                        var response_location = await client.query(query_location)

                                                        var list_picture = []
                                                        var profilePicture = ""

                                                        for (const i in response_query.rows) {
                                                            if (response_query.rows[i].profile_picture == false)
                                                                list_picture.push(response_query.rows[i].url_picture)
                                                            else
                                                                profilePicture = response_query.rows[i].url_picture
                                                        }
                                                        let i = 0;
                                                        while(tab[i][1] != result.rows[index].id){
                                                            i++
                                                        }
                                                        var score_user = tab[i][0]

                                                        if (result.rows[index].hashtags != null){
                                                            var hashtags = result.rows[index].hashtags.split(',')
                                                            for(const index in hashtags){
                                                                hashtags[index] = hashtags[index].trim()
                                                            }
                                                        } else {
                                                            hashtags = []
                                                        }
                                                        if (response_location.rows[0] != undefined)
                                                            localisation = response_location.rows[0]
                                                        else
                                                            localisation = null
                                                        var user = {
                                                            id: result.rows[index].id,
                                                            login: result.rows[index].login,
                                                            name: result.rows[index].name,
                                                            firstname: result.rows[index].firstname,
                                                            age: result.rows[index].age,
                                                            hashtags: hashtags,
                                                            description: result.rows[index].description,
                                                            location: localisation,
                                                            pictures: list_picture,
                                                            profilePicture: profilePicture,
                                                            lastConnection: result.rows[index].last_connection,
                                                            online: result.rows[index].online,
                                                            score: score_user
                                                        }
                                                        response.push(user)
                                                    }
                                                    done()
                                                    return res.status(200).json(response)
                                                    
                                                })
                                            }
                                            else {
                                                return res.status(200).json({})
                                            }
                                        }
                                    })
                                }
                            })
                        // }
                        // else
                        //     return res.status(401).send('Unauthorized');
                    // })
                }
                else
                    return res.status(401).send('Unauthorized');
            })
        })
    }
}

async function calc_score_match(hashtags, my_hashtags) {
    if ((hashtags != undefined && my_hashtags != undefined) && (hashtags != null && my_hashtags != null)) {
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