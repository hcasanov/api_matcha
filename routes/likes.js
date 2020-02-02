const jwt_decode = require('jwt-decode');
const pg = require('pg');
const Matchs = require('./matchs');

const config = {
    user: process.env.SQL_USER,
    host: process.env.SQL_HOST,
    database: process.env.SQL_DATABASE,
    port: process.env.SQL_POT
};
const pool = new pg.Pool(config);

module.exports = {
    post: function(req, res){
        if (req.body.token == undefined || req.body.to_id == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(function (err, client, done) {
            var id = jwt_decode(req.body.token).id;
            var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
            client.query(query, (err, result) => {
                if (err)
                    return res.status(500).send('Internal Server Error');
                else if (result == undefined)
                    return res.status(401).send('Unauthorized');
                else if (result.rows[0].token === req.body.token) {
                    var date_created = Date();
                    var update_query = "INSERT INTO likes (from_id, to_id, date_created, status) VALUES (" + id + ", " + req.body.to_id + ", \'" + date_created + "\', true);";
                    client.query(update_query, (err, result) => {
                        if (err){
                            console.log(err);
                            return res.status(500).send('Internal Server Error');
                        }
                        var update_query = "SELECT id, from_id FROM likes WHERE to_id = " + id + " AND from_id = " + req.body.to_id + ";";
                        client.query(update_query, async (err, result) => {
                            if (err){
                                done();
                                console.log(err)
                                return res.status(500).send('Internal Server Error');
                            }
                            if (result.rows[0] === undefined){
                                done();
                                console.log(result);
                                return res.status(200).send('OK');
                            }
                            else
                            {
                                var match = await Matchs.post(id, result.rows[0].from_id);
                                if (match == 'ERROR')
                                    return res.status(500).send('Internal Server Error')
                                var update_query = "DELETE FROM likes WHERE id = " + result.rows[0].id + ";";
                                client.query(update_query, async (err, result) => {
                                    if (err){
                                        console.log(err);
                                        return res.status(500).send('Internal Server Error');
                                    }
                                    else{
                                        res.status(250).send('Match'); // Code 250 = match
                                    }
                                })
                            }
                        })
                    })
                }
                else
                    return res.status(401).send('Unauthorized');
            })
        })
    }
}