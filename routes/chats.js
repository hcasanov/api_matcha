const jwt_decode = require('jwt-decode');
const pg = require('pg');

const config = {
    user: process.env.SQL_USER,
    host: process.env.SQL_HOST,
    database: process.env.SQL_DATABASE,
    port: process.env.SQL_PORT
};
const pool = new pg.Pool(config);

module.exports = {
    post: function(req, res) {
        if (req.headers.token == undefined || req.body.from_id == undefined || req.body.to_id == undefined || req.body.message == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(function(err, client, done) {
            var id = jwt_decode(req.headers.token).id;
            var query = "SELECT token FROM accounts WHERE id = " + id + ";";
            client.query(query, (err, result) => {
                if (err != null)
                    return res.status(500).send('Internal Server Error');
                else if (result.rows[0] === undefined)
                    return res.status(401).send('Unauthorized');
                else if (result.rows[0].token === req.headers.token){
                    var date_created = new Date();
                    var update_query = "INSERT INTO chats (from_id, to_id, message, date_created) VALUES (" + req.body.from_id + ", " + req.body.to_id + ", \'" + req.body.message + "\', \'" + date_created + "\');";
                    client.query(update_query, (err, result) => {
                        done();
                        if (err)
                            return res.status(500).send('Internal Server Error');
                        return res.status(200).send('OK');
                    })
                }
                else
                    return res.status(401).send('Unauthorized');
            })
        })
    },
    get: function(req, res) {
        if (req.headers.token == undefined || req.body.from_id == undefined || req.body.to_id == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(function(err, client, done) {
            var id = jwt_decode(req.headers.token).id;
            var query = "SELECT token FROM accounts WHERE id = " + id + ";";
            client.query(query, (err, result) => {
                if (err != null)
                    return res.status(500).send('Internal Server Error');
                else if (result.rows[0] === undefined)
                    return res.status(401).send('Unauthorized');
                else if (result.rows[0].token === req.headers.token){
                    var update_query = "SELECT from_id, to_id, message, date_created FROM chats WHERE from_id = " + req.body.from_id + " AND to_id = " + req.body.to_id + " ORDER BY date_created DESC;";
                    client.query(update_query, (err, result) => {
                        done();
                        if (err)
                            return res.status(500).send('Internal Server Error');
                        return res.status(200).json(result.rows);
                    })
                }
                else
                    return res.status(401).send('Unauthorized');
            })
        })
    }
}