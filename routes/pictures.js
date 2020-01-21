const jwt_decode = require('jwt-decode');
const pg = require('pg');

const config = {
    user: process.env.SQL_USER,
    host: process.env.SQL_HOST,
    database: process.env.SQL_DATABASE,
    port: process.env.SQL_POT
};
const pool = new pg.Pool(config);

module.exports = {
    post: function (req, res) {
        if (req.body.token == undefined || req.body.url_picture == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(function (err, client, done) {
            var id = jwt_decode(req.body.token).id;
            var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
            client.query(query, (err, result) => {
                if (err != null)
                    return res.status(500).send('Internal Server Error');
                else if (result.rows[0] === undefined)
                    return res.status(401).send('Unauthorized');
                else if (result.rows[0].token === req.body.token) {
                    var date_created = new Date();
                    var url = req.body.url_picture;
                    var file_name = url.split('/').reverse();
                    var update_query = "INSERT INTO pictures (id_account, url_picture, file_name, date_created) VALUES (\'" + id + "\', \'" + req.body.url_picture + "\', \'" + file_name[0] + "\', \'" + date_created + "\');";
                    client.query(update_query, (err, result) => {
                        done();
                        if (err)
                            return res.status(500).send('Internal Server Error');
                        else
                            return res.status(200).send('OK');
                    })
                }
                else
                    return res.status(401).send('Unauthorized');
            })
        })
    },
    get: function (req, res) {
        if (req.body.token == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(function (err, client, done) {
            var id = jwt_decode(req.body.token).id;
            var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
            client.query(query, (err, result) => {
                if (err != null)
                    return res.status(500).send('Internal Server Error');
                else if (result.rows[0] === undefined)
                    return res.status(401).send('Unauthorized');
                else if (result.rows[0].token === req.body.token) {
                    var update_query = "SELECT url_picture FROM pictures WHERE id_account = \'" + id + "\';";
                    client.query(update_query, (err, result) => {
                        done();
                        var pictures = result.rows;
                        if (err)
                            return res.status(500).send('Internal Server Error');
                        else
                            return res.status(200).json(pictures);
                    })
                }
                else
                    return res.status(401).send('Unauthorized');
            })
        })
    },
    delete: function (req, res) {
        if (req.body.token == undefined || req.body.url_picture == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(function (err, client, done) {
            var id = jwt_decode(req.body.token).id;
            var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
            client.query(query, (err, result) => {
                if (err != null)
                    return res.status(500).send('Internal Server Error');
                else if (result.rows[0] === undefined)
                    return res.status(401).send('Unauthorized');
                else if (result.rows[0].token === req.body.token) {
                    var update_query = "DELETE FROM pictures WHERE url_picture = \'" + req.body.url_picture + "\'";
                    client.query(update_query, (err, result) => {
                        done();
                        if (err)
                            return res.status(500).send('Internal Server Error');
                        else
                            return res.status(200).send('OK');
                    })
                }
                else
                    return res.status(401).send('Unauthorized');
            })
        })
    }
}