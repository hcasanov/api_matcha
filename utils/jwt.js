var jwt = require('jsonwebtoken');
const database = require('../config/db');

const JWT_SIGN_SECRET = 'z+4cc"uj&]:sNu7qkb?9ZZA[vUA3WS8bm}2zp>dCZ/?mktf65e5sa4t*eR';

module.exports = {
    generateTokenLogin: function(id){
        var tokenGen = jwt.sign({
            id: id,
        }, JWT_SIGN_SECRET, {
            expiresIn: '1h'
        });
        database.query("UPDATE accounts SET token = \'" + tokenGen + "\' WHERE id = \'" + id + "\';");
        return tokenGen;
    }
}