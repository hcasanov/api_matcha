const bcrypt = require('bcrypt');
const JWT = require('../utils/jwt');
var jwtDecode = require('jwt-decode');
const nodemailer = require('nodemailer');
const Checker = require('../utils/checker');
const database = require('../config/db');

module.exports = {
    register: async function(req, res) {
        return res.send('ok');
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