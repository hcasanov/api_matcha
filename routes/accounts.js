const bcrypt = require('bcrypt');
const JWT = require('../utils/jwt');
const jwt_decode = require('jwt-decode');
const nodemailer = require('nodemailer');
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
    register: async function (req, res) {

        // Parsing
        let { error } = Checker.ValidationError(req.body);
        if (error) {
            return res.status(403).send(error.details[0].message)
        }

        if (!Checker.isAdult(req.body.dateBirth))
            return res.status(403).send("Too young to subscribe");

        if (!Checker.checkPasswd(req.body.passwd, req.body.repeatPasswd))
            return res.status(403).send("Incorrect password");

        Checker.accountExist(req.body.mail, async function (result) {
            if (result)
                return res.status(400).send('Account already exist')
            var passwd = await bcrypt.hash(req.body.passwd, 10);

            // Query to database
            var new_account = database.query("INSERT INTO accounts (name, firstname, mail, passwd, datebirth) VALUES (\'" + req.body.name + "\', \'" + req.body.firstname + "\', \'" + req.body.mail + "\', \'" + passwd + "\', \'" + req.body.dateBirth + "\') ");
            if (new_account == 'error')
                return res.status(500).send('Internal Server Error');
            else {
                var new_id = database.query("SELECT id FROM accounts WHERE mail = \'" + req.body.mail + "\';");
                var new_token = JWT.generateTokenLogin(new_id)
                token = {
                    'token': new_token
                }
                database.query("UPDATE accounts SET token = \'" + new_token + "\' WHERE id = \'" + new_id + "\';");
                return res.status(201).json(token);
            }
        });
    },
    login: function (req, res) {
        let { error } = Checker.ValidationErrorLogin(req.body)
        if (error) {
            return res.status(403).send(error.details[0].message);
        }

        pool.connect(function (err, client, done) {
            client.query("SELECT id, passwd FROM accounts WHERE mail = \'" + req.body.mail + "\';", (err, result) => {

                found = result.rows[0];
                if (err) {
                    console.log(err);
                    return res.status(500).send('Internal Server Error');
                }
                else if (result.rows[0] == undefined)
                    return res.status(404).send('Not Found');
                else {
                    bcrypt.compare(req.body.passwd, found.passwd, function (err, result) {
                        if (result) {
                            return res.status(202).json({
                                '_id': found.id,
                                'token': JWT.generateTokenLogin(found.id)
                            });
                        } else {
                            done();
                            return res.status(401).send("Unauthorized");
                        }
                    });
                }
            });
        })
    },
    name: async function (req, res) {
        if (req.body.token == undefined || req.body.name == undefined)
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
                    var update_query = "UPDATE accounts SET name = \'" + req.body.name + "\' WHERE id = \'" + id + "\';";
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
    firstname: function (req, res) {
        if (req.body.token == undefined || req.body.firstname == undefined)
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
                    var update_query = "UPDATE accounts SET firstname = \'" + req.body.firstname + "\' WHERE id = \'" + id + "\';";
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
    mail: function (req, res) {
        if (req.body.token == undefined || req.body.mail == undefined)
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
                    var update_query = "UPDATE accounts SET mail = \'" + req.body.mail + "\' WHERE id = \'" + id + "\';";
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
    passwd: function (req, res) {
        if (req.body.token == undefined || req.body.passwd == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(async function (err, client, done) {
            var id = await jwt_decode(req.body.token).id;
            var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
            client.query(query, async (err, result) => {
                if (err)
                    return res.status(500).send('Internal Server Error');
                else if (result == undefined)
                    return res.status(401).send('Unauthorized');
                else if (result.rows[0].token === req.body.token) {
                    var passwd = await bcrypt.hash(req.body.passwd, 10);
                    var update_query = "UPDATE accounts SET passwd = \'" + passwd + "\' WHERE id = \'" + id + "\';";
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
    dateBirth: function (req, res) {
        if (req.body.token == undefined || req.body.dateBirth == undefined)
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
                    var update_query = "UPDATE accounts SET datebirth = \'" + req.body.dateBirth + "\' WHERE id = \'" + id + "\';";
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
    gender: function (req, res) {
        if (req.body.token == undefined || req.body.gender == undefined)
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
                    var update_query = "UPDATE accounts SET gender = \'" + req.body.gender + "\' WHERE id = \'" + id + "\';";
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
    description: function (req, res) {
        if (req.body.token == undefined || req.body.description == undefined)
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
                    var update_query = "UPDATE accounts SET description = \'" + req.body.description + "\' WHERE id = \'" + id + "\';";
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
    hashtags: function (req, res) {
        if (req.body.token == undefined || req.body.hashtags == undefined)
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
                    var update_query = "UPDATE accounts SET hashtags = \'" + req.body.hashtags + "\' WHERE id = \'" + id + "\';";
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
    research_hashtags: function (req, res) {
        if (req.body.token == undefined || req.body.research_hashtags == undefined)
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
                    var update_query = "UPDATE accounts SET research_hashtags = \'" + req.body.research_hashtags + "\' WHERE id = \'" + id + "\';";
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
    research_perimeter: function (req, res) {
        if (req.body.token == undefined || req.body.research_perimeter == undefined)
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
                    var update_query = "UPDATE accounts SET research_perimeter = \'" + req.body.research_perimeter + "\' WHERE id = \'" + id + "\';";
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
    research_gender: function (req, res) {
        if (req.body.token == undefined || req.body.research_gender == undefined)
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
                    var update_query = "UPDATE accounts SET research_gender = \'" + req.body.research_gender + "\' WHERE id = \'" + id + "\';";
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
    research_ageMin: function (req, res) {
        if (req.body.token == undefined || req.body.research_ageMin == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(function (err, client, done) {
            var id = jwt_decode(req.body.token).id;
            var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
            client.query(query, (err, result) => {
                if (err)
                    return res.status(500).send('Internal Server Error');
                else if (result.rows[0] == undefined)
                    return res.status(401).send('Unauthorized');
                else if (result.rows[0].token === req.body.token) {
                    var update_query = "UPDATE accounts SET research_age_min = \'" + req.body.research_ageMin + "\' WHERE id = \'" + id + "\';";
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
    research_ageMax: function (req, res) {
        if (req.body.token == undefined || req.body.research_ageMax == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(function (err, client, done) {
            var id = jwt_decode(req.body.token).id;
            var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
            client.query(query, (err, result) => {
                console.log(id)
                if (err)
                    return res.status(500).send('Internal Server Error');
                else if (result.rows[0] == undefined)
                    return res.status(401).send('Unauthorized');
                else if (result.rows[0].token === req.body.token) {
                    var update_query = "UPDATE accounts SET research_age_max = \'" + req.body.research_ageMax + "\' WHERE id = \'" + id + "\';";
                    client.query(update_query, (err, result) => {
                        if (err)
                            return res.status(500).send('Internal Server Error');
                        if (result == undefined)
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
    delete: function (req, res) {
        if (req.body.token == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(function (err, client, done) {
            var id = jwt_decode(req.body.token).id;
            var query = "DELETE FROM accounts WHERE id = \'" + id + "\';";
            client.query(query, (err, result) => {
                if (err)
                    return res.status(500).send('Internal Server Error');
                else if (result == undefined)
                    return res.status(401).send('Unauthorized');
                else
                    return res.status(200).send('OK');
            })
        })
    }
}