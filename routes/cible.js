const pg = require('pg');

const config = {
    user: process.env.SQL_USER,
    host: process.env.SQL_HOST,
    database: process.env.SQL_DATABASE,
    port: process.env.SQL_POT
};
const pool = new pg.Pool(config);

module.exports = {
    get_cible: function(from, callback) {
        pool.connect(function(err, client, done) {
            if (err)
                callback(err);
            else {
                var query = "SELECT * FROM accounts WHERE (age BETWEEN " + from.research_age_min + " AND " + from.research_age_max + ") AND gender = \'" + from.research_gender + "\' AND blocked = false AND id != " + from.id + ""
                client.query(query, (err, result) => {
                    if (err)
                        callback(err);
                    else {
                        callback(result);
                    }
                })
            }
        })
    }
}