const database = require('./db');

database.query("CREATE TABLE IF NOT EXISTS accounts (id SERIAL PRIMARY KEY NOT NULL, name VARCHAR(50) NOT NULL, firstname VARCHAR(50) NOT NULL, mail VARCHAR(50) NOT NULL, passwd VARCHAR(255) NOT NULL, datebirth TIMESTAMP NOT NULL, age SMALLINT, gender VARCHAR(10), description TEXT, hashtags TEXT, research_age_min SMALLINT, research_age_max SMALLINT, research_gender VARCHAR(10), research_hashtags TEXT, online BOOLEAN, blocked BOOLEAN default false, date_created TIMESTAMP, date_update TIMESTAMP, token VARCHAR(255) default null)\;");
database.query("CREATE TABLE IF NOT EXISTS pictures (id SERIAL PRIMARY KEY NOT NULL, account_id SMALLINT, src VARCHAR(255), file_name VARCHAR(100))\;");
database.query("CREATE TABLE IF NOT EXISTS localisation (id SERIAL PRIMARY KEY NOT NULL, latitude FLOAT NOT NULL, longitude FLOAT NOT NULL)\;");

setTimeout(exit, 1500);

function exit(){
    console.log('Database initialized !')
    process.exit();
}