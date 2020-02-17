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
    put: function(req, res){
        if (req.headers.token == undefined || req.body.latitude == undefined || req.body.longitude == undefined)
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