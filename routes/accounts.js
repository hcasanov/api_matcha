const bcrypt = require('bcrypt');
const JWT = require('../utils/jwt');
const jwt_decode = require('jwt-decode');
const send_mail = require('../utils/sendMail');
const Checker = require('../utils/checker');
const pg = require('pg');
const crypto = require('crypto');
const nodemailer = require('nodemailer')

const config = {
    user: process.env.SQL_USER,
    host: process.env.SQL_HOST,
    database: process.env.SQL_DATABASE,
    port: process.env.SQL_PORT
};
const pool = new pg.Pool(config);

module.exports = {
    register: async function (req, res) {
        console.log(req.body)
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
            pool.connect(async function (err, client, done) {
                var date_created = Date();
                var date_update = Date();
                var new_account = await client.query("INSERT INTO accounts (login, name, firstname, mail, passwd, datebirth, gender, date_created, date_update, confirm) VALUES (\'" + req.body.login + "\', \'" + req.body.name + "\', \'" + req.body.firstname + "\', \'" + req.body.mail + "\', \'" + passwd + "\', \'" + req.body.dateBirth + "\', \'" + req.body.gender + "\', \'" + date_created + "\', \'" + date_update + "\', false); ");
                var new_location = await client.query("INSERT INTO locations (latitude, longitude, date_created, date_update) VALUES (\'" + req.body.latitude + "\', \'" + req.body.longitude + "\', \'" + date_created + "\', \'" + date_update + "\'); ");
                if (new_account == 'error' || new_location == 'error') {
                    done();
                    return res.status(500).send('Internal Server Error');
                }
                else {
                    await client.query("SELECT id FROM accounts WHERE mail = \'" + req.body.mail + "\';", async function (err, result) {
                        if (err) {
                            done();
                            return res.status(500).send('Internal Server Error')
                        }
                        var new_id = result.rows[0].id;
                        var new_token = JWT.generateTokenLogin(new_id)
                        await client.query("UPDATE accounts SET token = \'" + new_token + "\' WHERE id = \'" + new_id + "\';");
                        crypto.randomBytes(15, (err, buf) => {
                            if (err) throw err;
                            var token_confirm = buf.toString('hex')
                            client.query("UPDATE accounts SET token_confirm = \'" + token_confirm + "\' WHERE id = \'" + new_id + "\'", (err, result) => {
                                done()
                                if (err) {
                                    res.status(500).send('Internal Server Error')
                                }
                                // return res.status(200).send('OK')
                                send_mail(token_confirm, req, (response) => {
                                    if (response === "OK")
                                        return res.status(200).send('OK')
                                    else
                                        return res.status(500).send('Internal Server Error')
                                })
                            })
                        });
                    })
                }
            })
        });
    },
    confirm_register: function (req, res) {

        pool.connect(async function (err, client, done) {
            var date_update = Date();
            var update = await client.query("UPDATE accounts SET confirm = true, date_update = \'" + date_update + "\' WHERE token_confirm = \'" + req.params.token_confirm + "\'");
            if (update == 'error') {
                done();
                return res.status(500).send('Internal Server Error');
            }
            else {
                res.status(200).send('OK')
            }
        })
    },
    login: function (req, res) {
        let { error } = Checker.ValidationErrorLogin(req.body)
        if (error) {
            return res.status(403).send(error.details[0].message);
        }

        pool.connect(function (err, client, done) {
            client.query("SELECT id, passwd, confirm FROM accounts WHERE mail = \'" + req.body.mail + "\';", (err, result) => {
                found = result.rows[0];
                if (err) {
                    console.log(err);
                    return res.status(500).send('Internal Server Error');
                }
                else if (found == undefined)
                    return res.status(404).send('Not Found');
                else if (found.confirm == false)
                    return res.status(401).send('Unauthorizeds');
                else {
                    bcrypt.compare(req.body.passwd, found.passwd, function (err, result) {
                        if (result) {
                            var token = JWT.generateTokenLogin(found.id);
                            client.query("UPDATE accounts SET token = \'" + token + "\', online = true;", function (err) {
                                done();
                                return res.status(202).json({
                                    '_id': found.id,
                                    'token': token
                                });
                            })
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
        if (req.headers.token == undefined || req.body.name == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(function (err, client, done) {
            var id = jwt_decode(req.headers.token).id;
            var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
            client.query(query, (err, result) => {
                if (err)
                    return res.status(500).send('Internal Server Error');
                else if (result == undefined)
                    return res.status(401).send('Unauthorized');
                else if (result.rows[0].token === req.headers.token) {
                    var date_update = Date();
                    var update_query = "UPDATE accounts SET name = \'" + req.body.name + "\', date_update = \'" + date_update + "\' WHERE id = \'" + id + "\';";
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
    userLogin: async function (req, res) {
        if (req.headers.token == undefined || req.body.login == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(function (err, client, done) {
            var id = jwt_decode(req.headers.token).id;
            var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
            client.query(query, (err, result) => {
                if (err)
                    return res.status(500).send('Internal Server Error');
                else if (result == undefined)
                    return res.status(401).send('Unauthorized');
                else if (result.rows[0].token === req.headers.token) {
                    var date_update = Date();
                    var update_query = "UPDATE accounts SET login = \'" + req.body.login + "\', date_update = \'" + date_update + "\' WHERE id = \'" + id + "\';";
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
    firstname: function (req, res) {
        if (req.headers.token == undefined || req.body.firstname == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(function (err, client, done) {
            var id = jwt_decode(req.headers.token).id;
            var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
            client.query(query, (err, result) => {
                if (err)
                    return res.status(500).send('Internal Server Error');
                else if (result == undefined)
                    return res.status(401).send('Unauthorized');
                else if (result.rows[0].token === req.headers.token) {
                    var date_update = Date();
                    var update_query = "UPDATE accounts SET firstname = \'" + req.body.firstname + "\', date_update = \'" + date_update + "\' WHERE id = \'" + id + "\';";
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
    mail: function (req, res) {
        if (req.headers.token == undefined || req.body.mail == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(function (err, client, done) {
            var id = jwt_decode(req.headers.token).id;
            var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
            client.query(query, (err, result) => {
                if (err)
                    return res.status(500).send('Internal Server Error');
                else if (result == undefined)
                    return res.status(401).send('Unauthorized');
                else if (result.rows[0].token === req.headers.token) {
                    var date_update = Date();
                    var update_query = "UPDATE accounts SET mail = \'" + req.body.mail + "\', date_update = \'" + date_update + "\' WHERE id = \'" + id + "\';";
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
    passwd: function (req, res) {
        if (req.headers.token == undefined || req.body.passwd == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(async function (err, client, done) {
            var id = await jwt_decode(req.headers.token).id;
            var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
            client.query(query, async (err, result) => {
                if (err)
                    return res.status(500).send('Internal Server Error');
                else if (result == undefined)
                    return res.status(401).send('Unauthorized');
                else if (result.rows[0].token === req.headers.token) {
                    var date_update = Date();
                    var passwd = await bcrypt.hash(req.body.passwd, 10);
                    var update_query = "UPDATE accounts SET passwd = \'" + passwd + "\', date_update = \'" + date_update + "\' WHERE id = \'" + id + "\';";
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
    dateBirth: function (req, res) {
        if (req.headers.token == undefined || req.body.dateBirth == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(function (err, client, done) {
            var id = jwt_decode(req.headers.token).id;
            var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
            client.query(query, (err, result) => {
                if (err)
                    return res.status(500).send('Internal Server Error');
                else if (result == undefined)
                    return res.status(401).send('Unauthorized');
                else if (result.rows[0].token === req.headers.token) {
                    var date_update = Date();
                    var update_query = "UPDATE accounts SET datebirth = \'" + req.body.dateBirth + "\', \'" + date_update + "\' WHERE id = \'" + id + "\';";
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
    gender: function (req, res) {
        if (req.headers.token == undefined || req.body.gender == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(function (err, client, done) {
            var id = jwt_decode(req.headers.token).id;
            var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
            client.query(query, (err, result) => {
                if (err)
                    return res.status(500).send('Internal Server Error');
                else if (result == undefined)
                    return res.status(401).send('Unauthorized');
                else if (result.rows[0].token === req.headers.token) {
                    var date_update = Date();
                    var update_query = "UPDATE accounts SET gender = \'" + req.body.gender + "\', date_update = \'" + date_update + "\' WHERE id = \'" + id + "\';";
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
    description: function (req, res) {
        if (req.headers.token == undefined || req.body.description == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(function (err, client, done) {
            var id = jwt_decode(req.headers.token).id;
            var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
            client.query(query, (err, result) => {
                if (err)
                    return res.status(500).send('Internal Server Error');
                else if (result == undefined)
                    return res.status(401).send('Unauthorized');
                else if (result.rows[0].token === req.headers.token) {
                    var date_update = Date();
                    var update_query = "UPDATE accounts SET description = \'" + req.body.description + "\', date_update = \'" + date_update + "\' WHERE id = \'" + id + "\';";
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
    hashtags: function (req, res) {
        if (req.headers.token == undefined || req.body.hashtags == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(function (err, client, done) {
            var id = jwt_decode(req.headers.token).id;
            var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
            client.query(query, (err, result) => {
                if (err)
                    return res.status(500).send('Internal Server Error');
                else if (result == undefined)
                    return res.status(401).send('Unauthorized');
                else if (result.rows[0].token === req.headers.token) {
                    var date_update = Date();
                    var update_query = "UPDATE accounts SET hashtags = \'" + req.body.hashtags + "\', date_update = \'" + date_update + "\' WHERE id = \'" + id + "\';";
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
    research_hashtags: function (req, res) {
        if (req.headers.token == undefined || req.body.research_hashtags == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(function (err, client, done) {
            var id = jwt_decode(req.headers.token).id;
            var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
            client.query(query, (err, result) => {
                if (err)
                    return res.status(500).send('Internal Server Error');
                else if (result == undefined)
                    return res.status(401).send('Unauthorized');
                else if (result.rows[0].token === req.headers.token) {
                    var date_update = Date();
                    var update_query = "UPDATE accounts SET research_hashtags = \'" + req.body.research_hashtags + "\', date_update = \'" + date_update + "\' WHERE id = \'" + id + "\';";
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
    research_perimeter: function (req, res) {
        if (req.headers.token == undefined || req.body.research_perimeter == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(function (err, client, done) {
            var id = jwt_decode(req.headers.token).id;
            var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
            client.query(query, (err, result) => {
                if (err)
                    return res.status(500).send('Internal Server Error');
                else if (result == undefined)
                    return res.status(401).send('Unauthorized');
                else if (result.rows[0].token === req.headers.token) {
                    var date_update = Date();
                    var update_query = "UPDATE accounts SET research_perimeter = \'" + req.body.research_perimeter + "\', date_update = \'" + date_update + "\' WHERE id = \'" + id + "\';";
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
    research_gender: function (req, res) {
        if (req.headers.token == undefined || req.body.research_gender == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(function (err, client, done) {
            var id = jwt_decode(req.headers.token).id;
            var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
            client.query(query, (err, result) => {
                if (err)
                    return res.status(500).send('Internal Server Error');
                else if (result == undefined)
                    return res.status(401).send('Unauthorized');
                else if (result.rows[0].token === req.headers.token) {
                    var date_update = Date();
                    var update_query = "UPDATE accounts SET research_gender = \'" + req.body.research_gender + "\', date_update = \'" + date_update + "\' WHERE id = \'" + id + "\';";
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
    research_ageMin: function (req, res) {
        if (req.headers.token == undefined || req.body.research_ageMin == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(function (err, client, done) {
            var id = jwt_decode(req.headers.token).id;
            var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
            client.query(query, (err, result) => {
                if (err)
                    return res.status(500).send('Internal Server Error');
                else if (result.rows[0] == undefined)
                    return res.status(401).send('Unauthorized');
                else if (result.rows[0].token === req.headers.token) {
                    var date_update = Date();
                    var update_query = "UPDATE accounts SET research_age_min = \'" + req.body.research_ageMin + "\', date_update = \'" + date_update + "\' WHERE id = \'" + id + "\';";
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
    research_ageMax: function (req, res) {
        if (req.headers.token == undefined || req.body.research_ageMax == undefined)
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
                    var date_update = Date();
                    var update_query = "UPDATE accounts SET research_age_max = \'" + req.body.research_ageMax + "\', date_update = \'" + date_update + "\' WHERE id = \'" + id + "\';";
                    client.query(update_query, (err, result) => {
                        done();
                        if (err)
                            return res.status(500).send('Internal Server Error');
                        if (result == undefined)
                            return res.status(500).send('Internal Server Error');
                        return res.status(200).send('OK');
                    })
                }
                else
                    return res.status(401).send('Unauthorized');
            })
        })
    },
    delete: function (req, res) {
        if (req.headers.token == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(function (err, client, done) {
            var id = jwt_decode(req.headers.token).id;
            var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
            client.query(query, (err, result) => {
                if (err)
                    return res.status(500).send('Internal Server Error');
                else if (result.rows[0] == undefined)
                    return res.status(401).send('Unauthorized');
                else if (result.rows[0].token === req.headers.token) {
                    var query = "DELETE FROM accounts WHERE id = \'" + id + "\';";
                    client.query(query, (err, result) => {
                        done();
                        if (err)
                            return res.status(500).send('Internal Server Error');
                        else if (result == undefined)
                            return res.status(401).send('Unauthorized');
                        else
                            return res.status(200).send('OK');
                    })
                }
                else
                    return res.status(401).send('Unauthorized');
            })
        })
    },
    get_params: function (req, res) {
        if (req.headers.token == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(function (err, client, done) {
            var id = jwt_decode(req.headers.token).id;
            var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
            client.query(query, (err, result) => {
                if (err)
                    return res.status(500).send('Internal Server Error');
                else if (result.rows[0] == undefined)
                    return res.status(401).send('Unauthorized');
                else if (result.rows[0].token === req.headers.token) {
                    var query = "SELECT id, login, name, firstname, mail, datebirth, gender, description, age, hashtags, research_perimeter, research_age_min, research_age_max, research_gender, research_hashtags FROM accounts WHERE id = " + id + " ;";
                    client.query(query, (err, result) => {
                        done();
                        if (err)
                            return res.status(500).send('Internal Server Error');
                        else if (result == undefined)
                            return res.status(401).send('Unauthorized');
                        else {
                            if (result.rows[0].hashtags != undefined) {
                                var tab_hashtags = result.rows[0].hashtags.split(',');
                                result.rows[0].hashtags = tab_hashtags;
                            }
                            return res.status(200).json(result.rows);
                        }
                    })
                }
                else
                    return res.status(401).send('Unauthorized');
            })
        })
    },
    disconnect: function (req, res) {
        if (req.headers.token == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(function (err, client, done) {
            var id = jwt_decode(req.headers.token).id;
            var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
            client.query(query, (err, result) => {
                if (err)
                    return res.status(500).send('Internal Server Error');
                else if (result.rows[0] == undefined)
                    return res.status(401).send('Unauthorized');
                else if (result.rows[0].token === req.headers.token) {
                    var lastConnection = new Date()
                    var query = "UPDATE accounts SET online = false, last_connection = \'" + lastConnection + "\' WHERE id = " + id + ";"
                    console.log(query)
                    client.query(query, (err, result) => {
                        if (err)
                            return res.status(500).send('Internal Server Error')
                        else {
                            return res.status(200).send('Disconnected')
                        }
                    })
                }
                else
                    return res.status(401).send('Unauthorized');
            })
        })
    },
    forgotPasswd: async function (req, res) { // Get mail in body
        Checker.accountExist(req.body.mail, (result) => {
            if (result) {
                pool.connect(function (err, client, done) {
                    crypto.randomBytes(6, async (err, buf) => {
                        if (err) throw err;
                        var new_passwd = buf.toString('hex')
                        var hash = await bcrypt.hash(new_passwd, 10);
                        client.query("UPDATE accounts SET passwd = \'" + hash + "\' WHERE mail = \'" + req.body.mail + "\'", (err, result) => {
                            done()
                            if (err) {
                                return res.status(500).send('Internal Server Error')
                            }
                            var transporter = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {
                                    user: 'noelledeur@gmail.com',
                                    pass: 'Lemotdepasseestmotdepasse'
                                }
                            });

                            const mailOptions = {
                                from: 'noelledeur@gmail.com', // sender address
                                to: req.body.mail, // list of receivers
                                subject: 'Forgot password matcha', // Subject line
                                html: "Votre nouveau mot de passe est " + new_passwd + " ",// plaintext body
                            };

                            transporter.sendMail(mailOptions, function (err, info) {
                                if (err)
                                    console.log(err)
                                else
                                    return res.status(200).send('OK')
                            });
                        })
                    });
                })
            }
            else {
                return res.status(400).send('Account doesn\'t exist !')
            }
        })
    },
    report: function (req, res) {
        if (req.headers.token == undefined || req.body.to_id == undefined || req.body.message == undefined)
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
                    var date_created = Date();
                    var from_id = id;
                    var to_id = req.body.to_id;
                    var message = req.body.message;
                    var query_insert = "INSERT INTO reports (from_id, to_id, message, created_date) VALUES (" + from_id + ", " + to_id + ", " + message + ", " + date_created + ")"
                    client.query(query_insert, (err, result) => {
                        if (err)
                            return res.status(500).send('Internal Server Error')
                        var transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: 'noelledeur@gmail.com',
                                pass: 'Lemotdepasseestmotdepasse'
                            }
                        });

                        const mailOptions = {
                            from: 'noelledeur@gmail.com', // sender address
                            to: "hcasanov@student.42.fr", // list of receivers
                            subject: 'Forgot password matcha', // Subject line
                            html: "Le user avec l'id " + req.body.to_id + " a été report pour la raison : \'" + req.body.message + "\' !",// plaintext body
                        };

                        transporter.sendMail(mailOptions, function (err, info) {
                            if (err)
                                console.log(err)
                            else
                                return res.status(200).send('OK')
                        });
                        $.ajax({
                            url: "http://localhost:8080/notifications"
                        })
                    })
                }
                else
                    return res.status(401).send('Unauthorized');
            })
        })
    }
}