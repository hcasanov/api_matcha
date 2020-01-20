const jwt = require('jsonwebtoken');
const jwt_decode = require('jwt-decode');
const database = require('../config/db');
const pg = require('pg');

const JWT_SIGN_SECRET = 'z+4cc"uj&]:sNu7qkb?9ZZA[vUA3WS8bm}2zp>dCZ/?mktf65e5sa4t*eR';

// Database config
const config = {
    user: process.env.SQL_USER,
    host: process.env.SQL_HOST,
    database: process.env.SQL_DATABASE,
    port: process.env.SQL_POT
};
const pool = new pg.Pool(config);

module.exports = {
    generateTokenLogin: function(id){
        var tokenGen = jwt.sign({
            id: id,
        }, JWT_SIGN_SECRET, {
            expiresIn: '1h'
        });
        return tokenGen;
    }
}