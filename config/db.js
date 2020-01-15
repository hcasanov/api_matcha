const pg = require('pg');
const body = require('body-parser');
require('dotenv').config();

const config = {
    user: process.env.SQL_USER,
    host: process.env.SQL_HOST,
    database: process.env.SQL_DATABASE,
    port: process.env.SQL_POT
};

const pool = new pg.Pool(config);

module.exports = {
    query: function(req){
        pool.connect(function(err, client, done) {
            client.query(req, (err, result) => {
                done();
                if (err){
                    console.log(err);
                    return('error');
                }
                else {
                    return (result);
                }
            });
        })
    }
}