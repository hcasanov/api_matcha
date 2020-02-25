const jwt_decode = require('jwt-decode');
const pg = require('pg');
const Notifications = require('./notifications');

const config = {
    user: process.env.SQL_USER,
    host: process.env.SQL_HOST,
    database: process.env.SQL_DATABASE,
    port: process.env.SQL_PORT
};
const pool = new pg.Pool(config);

module.exports = {
    post: function(from_id, to_id) {
        pool.connect(function(err, client, done){
            if (err){
                console.log('err')
                return 'ERROR';
            }
            var date_created = new Date();
            var query = "INSERT INTO matchs (to_id, from_id, date_created, status) VALUES (" + to_id + ", " + from_id + ", \'" + date_created + "\', true);";
            client.query(query, function (err, result){
                if (err){
                    done();
                    console.log(err);
                    return 'ERROR';
                }
                var query = "SELECT id, from_id, to_id FROM matchs WHERE to_id = " + to_id + " AND from_id = " + from_id + ";";
                client.query(query, function (err, result){
                    if (err){
                        done();
                        console.log(err);
                        return 'ERROR';
                    }
                    var data = {
                        from_id: from_id,
                        to_id: to_id,
                        match_id: result.rows[0].id
                    }
                    Notifications.new_match(data);
                    done();
                    return result.rows
                })
            })
        })
    },
    get: function(req, res){
        if (req.headers.token == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(function(err, client, done) {
            var id = jwt_decode(req.headers.token).id;
            var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
            client.query(query, (err, result) => {
                if (err)
                    return res.status(500).send('Internal Server Error');
                else if (result.rows[0] == undefined)
                    return res.status(401).send('Unauthorized');
                else if (result.rows[0].token === req.headers.token){
                    var get_query = "SELECT * FROM matchs WHERE (from_id = " + id + ") OR (to_id = " + id + ")";
                    client.query(get_query, (err, result) => {
                        if (err)
                            return res.status(500).send('Internal Server Error');
                        var list_matchs = ""
                        if (result.rows[0] != undefined){
                            for (const index in result.rows){
                                if (result.rows[index].from_id != id){
                                    if (list_matchs === "")
                                        list_matchs = result.rows[index].from_id
                                    else
                                        list_matchs = list_matchs + ", " + result.rows[index].from_id
                                } else {
                                    if (list_matchs === "")
                                        list_matchs = result.rows[index].to_id
                                    else
                                        list_matchs = list_matchs + ", " + result.rows[index].to_id
                                }
                            }
                            var select_matchs_query = "SELECT id, login, name, firstname, age, hashtags, description FROM accounts WHERE id IN (" + list_matchs + ");"
                            client.query(select_matchs_query, async (err, result) => {
                                if (err)
                                    return res.status(500).send('Internal Server Error');
                                if (result.rows[0] != undefined){
                                    var response = []
                                    for (const index in result.rows){
                                        var query_pictures = "SELECT url_picture, profile_picture FROM pictures WHERE id_account = " + result.rows[index].id + ";"
                                        var query_location = "SELECT latitude, longitude FROM locations WHERE id = " + result.rows[index].id + ";"

                                        var pictures = await client.query(query_pictures)
                                        var locations = await client.query(query_location)

                                        var list_picture = []
                                        var profilePicture = ""
                                        for (const i in pictures.rows){
                                            if (pictures.rows[i].profile_picture == false)
                                                list_picture.push(pictures.rows[i].url_picture)
                                            else
                                                profilePicture = pictures.rows[i].url_picture
                                        }

                                        var user = {
                                            id: result.rows[index].id,
                                            login: result.rows[index].login,
                                            name: result.rows[index].name,
                                            firstname: result.rows[index].firstname,
                                            age: result.rows[index].age,
                                            hashtags: result.rows[index].hashtags,
                                            description: result.rows[index].description,
                                            location: locations.rows[0],
                                            pictures: list_picture,
                                            profilePicture: profilePicture
                                        }
                                        response.push(user)
                                    }
                                    return res.status(200).json(response)
                                }else {
                                    return res.satus(200).json({})
                                }
                            })
                        }
                    })
                }
                else
                    return res.status(401).send('Unauthorized');
            })
        })
    },
    unmatch: function (req, res) {
        if (req.headers.token == undefined || req.body.to_id == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(function (err, client, done) {
            var id = jwt_decode(req.headers.token).id;
            var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
            client.query(query, (err, result) => {
                console.log(id)
                if (err)
                    return res.status(500).send('Internal Server Error');
                else if (result.rows[0] == undefined)
                    return res.status(401).send('Unauthorized');
                else if (result.rows[0].token === req.headers.token) {
                    var to_id = req.body.to_id
                    var from_id = id
                    var query = "DELETE FROM matchs WHERE (from_id = " + to_id + " AND to_id = " + from_id + ") OR (from_id = " + from_id + " AND to_id = " + to_id + ")"
                    client.query(query, (err, result) => {
                        if (err)
                            return res.status(500).send('Internal Server Error')
                        return res.status(200).send('OK')
                    })
                }
                else
                    return res.status(401).send('Unauthorized');
            })
        })
    }
}