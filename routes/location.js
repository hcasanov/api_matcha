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
            var id = jwt_decode(req.body.token);
            return console.log(id);
            var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
            client.query(query, (err, result) => {
                if (err)
                    return res.status(500).send('Internal Server Error');
                else if (result == undefined)
                    return res.status(401).send('Unauthorized');
                else if (result.rows[0].token === req.body.token){
                    var date_created = new Date();
                    var date_update = new Date();
                    var update_query = "INSERT INTO location (id, longitude, latitude, date_created, date_uptade) VALUES (\'" + id + "\', \'" + req.body.longitude + "\', \'" + req.body.latitude + "\', \'" + date_created + "\', \'" + date_update + "\');";
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
    put: function(req, res){
        if (req.body.token == undefined || req.body.latitude == undefined || req.body.longitude == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(function(err, client, done) {
            var id = jwt_decode(req.body.token).id;
            var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
            client.query(query, (err, result) => {
                if (err)
                    return res.status(500).send('Internal Server Error');
                else if (result == undefined)
                    return res.status(401).send('Unauthorized');
                else if (result.rows[0].token === req.body.token){
                    var update_query = "UPDATE location SET latitude = \'" + req.body.latitude + "\', longitude = \'" + req.body.longitude + "\' WHERE id = \'" + id + "\';";
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
    // get: function(req, res){

    // }
}