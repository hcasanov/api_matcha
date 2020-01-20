const jwt_decode = require('jwt-decode');
const Checker = require('../utils/checker');
const database = require('../config/db');
const pg = require('pg');

const config = {
    user: process.env.SQL_USER,
    host: process.env.SQL_HOST,
    database: process.env.SQL_DATABASE,
    port: process.env.SQL_POT
};
const pool = new pg.Pool(config);

module.exports = {
    post: function(req, res){
        if (req.body.token == undefined || req.body.latitude == undefined || req.body.longitude == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(function(err, client, done) {
            var id = jwt_decode(req.body.token).id;
            var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
            client.query(query, (err, result) => {
                // return console.log(result)
                if (err != null)
                    return res.status(500).send('Internal Server Error');
                else if (result.rows[0] === undefined)
                    return res.status(401).send('Unauthorized');
                else if (result.rows[0].token === req.body.token){
                    var date_created = new Date();
                    var date_update = new Date();
                    var update_query = "INSERT INTO locations (id, longitude, latitude, date_created, date_update) VALUES (\'" + id + "\', \'" + req.body.longitude + "\', \'" + req.body.latitude + "\', \'" + date_created + "\', \'" + date_update + "\');";
                    client.query(update_query, (err, result) => {
                        done();
                        return console.log(err)
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
    put: function(req, res){
        if (req.body.token == undefined || req.body.latitude == undefined || req.body.longitude == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(function(err, client, done) {
            var id = jwt_decode(req.body.token).id;
            var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
            client.query(query, (err, result) => {
                if (err)
                    return res.status(500).send('Internal Server Error');
                else if (result.rows[0] == undefined)
                    return res.status(401).send('Unauthorized');
                else if (result.rows[0].token === req.body.token){
                    var date_update = new Date();
                    var update_query = "UPDATE locations SET latitude = \'" + req.body.latitude + "\', longitude = \'" + req.body.longitude + "\', date_update = \'" + date_update + "\' WHERE id = \'" + id + "\';";
                    client.query(update_query, (err, result) => {
                        if (err)
                            return res.status(500).send('Internal Server Error');
                        done();
                        return res.status(200).send('OK');
                    })
                }
                else
                    return res.status(401).send('Unauthorized');
            })
        })
    },
    get: function(req, res){
        if (req.body.token == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(function(err, client, done) {
            var id = jwt_decode(req.body.token).id;
            var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
            client.query(query, (err, result) => {
                if (err)
                    return res.status(500).send('Internal Server Error');
                else if (result.rows[0] == undefined)
                    return res.status(401).send('Unauthorized');
                else if (result.rows[0].token === req.body.token){
                    var get_query = "SELECT latitude, longitude FROM locations WHERE id = \'" + id + "\';";
                    client.query(get_query, (err, result) => {
                        done();
                        var position = result.rows[0];
                        if (err)
                            return res.status(500).send('Internal Server Error');
                        else
                            return res.status(200).json(position);
                    })
                }
                else
                    return res.status(401).send('Unauthorized');
            })
        })
    }
}