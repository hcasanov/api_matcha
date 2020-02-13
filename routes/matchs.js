const jwt_decode = require('jwt-decode');
const pg = require('pg');
const Notifications = require('./notifications');

const config = {
    user: process.env.SQL_USER,
    host: process.env.SQL_HOST,
    database: process.env.SQL_DATABASE,
    port: process.env.SQL_PORT
};
const pool = new pg.Pool(config);

module.exports = {
    post: function(from_id, to_id) {
        pool.connect(function(err, client, done){
            if (err){
                console.log('err')
                return 'ERROR';
            }
            var date_created = new Date();
            var query = "INSERT INTO matchs (to_id, from_id, date_created, status) VALUES (" + to_id + ", " + from_id + ", \'" + date_created + "\', true);";
            client.query(query, function (err, result){
                if (err){
                    done();
                    console.log(err);
                    return 'ERROR';
                }
                var query = "SELECT id, from_id, to_id FROM matchs WHERE to_id = " + to_id + " AND from_id = " + from_id + ";";
                client.query(query, function (err, result){
                    if (err){
                        done();
                        console.log(err);
                        return 'ERROR';
                    }
                    var data = {
                        from_id: from_id,
                        to_id: to_id,
                        match_id: result.rows[0].id
                    }
                    Notifications.new_match(data);
                    done();
                    return result.rows
                })
            })
        })
    }
}