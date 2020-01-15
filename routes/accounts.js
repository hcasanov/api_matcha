const bcrypt = require('bcrypt');
const JWT = require('../utils/jwt');
var jwtDecode = require('jwt-decode');
const nodemailer = require('nodemailer');
const Checker = require('../utils/checker');
const database = require('../config/db');

module.exports = {
    register: async function(req, res) {

        // Parsing
        let { error } = Checker.ValidationError(req.body);
        if (error) {
            return res.status(403).send(error.details[0].message)
        }

        if (!Checker.isAdult(req.body.dateBirth))
            return res.status(403).send("Too young to subscribe");

        if (!Checker.checkPasswd(req.body.passwd, req.body.repeatPasswd))
            return res.status(403).send("Incorrect password");

        // Query to database
        var new_account = database.query("INSERT INTO accounts (name, firstname, mail, passwd, datebirth) VALUES (\'" + req.body.name + "\', \'" + req.body.firstname + "\', \'" + req.body.mail + "\', \'" + req.body.passwd + "\', \'" + req.body.dateBirth + "\') ");
        if (new_account == 'error')
            return res.status(500).send('Internal Server Error');
        else
        {
            new_id = database.query("SELECT id FROM accounts WHERE mail = \'" + req.body.mail + "\';");
            token = {
                'token': JWT.generateTokenLogin(new_id)
            }
            return res.status(201).json(token);
        }

    },
    login: function(req, res){return res.send('ok');},
    name: function(req, res){return res.send('ok');},
    firstname: function(req, res){return res.send('ok');},
    mail: function(req, res){return res.send('ok');},
    passwd: function(req, res){return res.send('ok');},
    dateBirth: function(req, res){return res.send('ok');},
    gender: function(req, res){return res.send('ok');},
    description: function(req, res){return res.send('ok');},
    pictures: function(req, res){return res.send('ok');},
    hashtags: function(req, res){return res.send('ok');},
    research_hashtags: function(req, res){return res.send('ok');},
    research_myLatitude: function(req, res){return res.send('ok');},
    research_myLongitude: function(req, res){return res.send('ok');},
    research_perimeter: function(req, res){return res.send('ok');},
    research_gender: function(req, res){return res.send('ok');},
    research_ageMin: function(req, res){return res.send('ok');},
    research_ageMax: function(req, res){return res.send('ok');},
    delete: function(req, res){}

}