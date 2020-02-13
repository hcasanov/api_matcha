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
    new_like: function (req, res) {
        var from_id = req.body.from_id;
        var to_id = req.body.to_id;
        var type = "like";
        var like_id = req.body.like_id;
        var name = "New like";

        pool.connect(function (err, client, done) {
            if (err)
                return console.log(err)
            client.query("SELECT firstname FROM accounts WHERE id = \'" + from_id + "\';", (err, result) => {
                if (err)
                    return console.log(err)
                var firstname_from = result.rows[0].firstname;
                var message = "You got a new like, " + firstname_from + " like you";
                var status = true;
                var date_created = new Date();
                var date_update = new Date();
                client.query("INSERT INTO notifications (type, like_id, name, from_id, to_id, status, message, date_created, date_update) VALUES (\'" + type + "\', \'" + like_id + "\', \'" + name + "\', \'" + from_id + "\', \'" + to_id + "\', \'" + status + "\', \'" + message + "\', \'" + date_created + "\', \'" + date_update + "\');", (err) => {
                    done();
                    if (err) {
                        console.log(err);
                        return res.status(500)
                    }
                    else
                        res.status(200).send('OK');
                })
            })
        })

    },
    new_chat: function (req, res) {
        var from_id = req.body.from_id;
        var to_id = req.body.to_id;
        var type = "chat";
        var chat_id = req.body.chat_id;
        var name = "New message";

        pool.connect(function (err, client, done) {
            if (err)
                return console.log(err)
            client.query("SELECT firstname FROM accounts WHERE id = \'" + from_id + "\';", (err, result) => {
                if (err)
                    return console.log(err)
                var firstname_from = result.rows[0].firstname;
                var message = firstname_from + " send you a new message";
                var status = true;
                var date_created = new Date();
                var date_update = new Date();
                client.query("INSERT INTO notifications (type, chat_id, name, from_id, to_id, status, message, date_created, date_update) VALUES (\'" + type + "\', \'" + chat_id + "\', \'" + name + "\', \'" + from_id + "\', \'" + to_id + "\', \'" + status + "\', \'" + message + "\', \'" + date_created + "\', \'" + date_update + "\');", (err) => {
                    done();
                    if (err) {
                        console.log(err);
                        return res.status(500)
                    }
                    else
                        res.status(200).send('OK');
                })
            })
        })
    },
    new_match: function (req) {
        var from_id = req.from_id;
        var to_id = req.to_id;
        var type = "match";
        var match_id = req.match_id;
        var name = "Someone like you";

        pool.connect(function (err, client, done) {
            if (err)
                return console.log(err)
            var message = "You matched with someone";
            var status = true;
            var date_created = new Date();
            var date_update = new Date();
            client.query("INSERT INTO notifications (type, match_id, name, from_id, to_id, status, message, date_created, date_update) VALUES (\'" + type + "\', \'" + match_id + "\', \'" + name + "\', \'" + from_id + "\', \'" + to_id + "\', \'" + status + "\', \'" + message + "\', \'" + date_created + "\', \'" + date_update + "\');", (err) => {
                done();
                if (err) {
                    console.log(err);
                    return 'ERROR'
                }
                else
                    return 'OK'
            })
        })
    },
    welcome: function (req, res) {
        var to_id = req.body.to_id;
        var type = "welcome";
        var name = "New member";

        pool.connect(function (err, client, done) {
            if (err)
                return console.log(err)
            client.query("SELECT firstname FROM accounts WHERE id = \'" + from_id + "\';", (err, result) => {
                if (err)
                    return console.log(err)
                var firstname_from = result.rows[0].firstname;
                var message = firstname_from + " you are welcome to matcha ! 🚀";
                var status = true;
                var date_created = new Date();
                var date_update = new Date();
                client.query("INSERT INTO notifications (type, name, to_id, status, message, date_created, date_update) VALUES (\'" + type + "\', \'" + name + "\', \'" + to_id + "\', \'" + status + "\', \'" + message + "\', \'" + date_created + "\', \'" + date_update + "\');", (err) => {
                    done();
                    if (err) {
                        console.log(err);
                        return res.status(500)
                    }
                    else
                        res.status(200).send('OK');
                })
            })
        })
    },
    read: function (req, res) {
        if (req.headers.token == undefined || req.body.id_notification == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(function (err, client, done) {
            var id = jwt_decode(req.headers.token).id;
            var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
            client.query(query, (err, result) => {
                if (err != null)
                    return res.status(500).send('Internal Server Error');
                else if (result.rows[0] === undefined)
                    return res.status(401).send('Unauthorized');
                else if (result.rows[0].token === req.headers.token) {
                    var date_update = new Date();
                    var update_query = "UPDATE notifications SET status = false, date_update = \'" + date_update + "\' WHERE id = " + req.body.id_notification + ";";
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
        if (req.headers.token == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(function (err, client, done) {
            var id = jwt_decode(req.headers.token).id;
            var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
            client.query(query, (err, result) => {
                if (err != null)
                    return res.status(500).send('Internal Server Error');
                else if (result.rows[0] === undefined)
                    return res.status(401).send('Unauthorized');
                else if (result.rows[0].token === req.headers.token) {
                    var update_query = "SELECT id, name, message, status FROM notifications WHERE to_id = " + id + " ORDER BY date_created DESC;";
                    client.query(update_query, (err, result) => {
                        done();
                        if (err)
                            return res.status(500).send('Internal Server Error');
                        else
                            return res.status(200).json(result.rows);
                    })
                }
                else
                    return res.status(401).send('Unauthorized');
            })
        })
    }
}