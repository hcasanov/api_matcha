const database = require('./db');

database.query("DROP TABLE IF EXISTS accounts;");
database.query("DROP TABLE IF EXISTS pictures;");
database.query("DROP TABLE IF EXISTS locations;");
setTimeout(init, 2000);

setTimeout(exit, 3000);

function exit(){
    console.log('Database initialized !');
    process.exit();
}

function init(){
    database.query("CREATE TABLE IF NOT EXISTS accounts (id SERIAL PRIMARY KEY NOT NULL, name VARCHAR(50) NOT NULL, firstname VARCHAR(50) NOT NULL, mail VARCHAR(50) NOT NULL, passwd VARCHAR(255) NOT NULL, datebirth DATE NOT NULL, age SMALLINT, gender VARCHAR(10), description TEXT, hashtags TEXT, research_age_min SMALLINT, research_age_max SMALLINT, research_gender VARCHAR(10), research_hashtags TEXT, online BOOLEAN, blocked BOOLEAN default false, date_created VARCHAR(100), date_update VARCHAR(100), token VARCHAR(255) default null)\;");
    database.query("CREATE TABLE IF NOT EXISTS pictures (id SERIAL PRIMARY KEY NOT NULL, id_account SMALLINT, url_picture VARCHAR(255), file_name VARCHAR(100), date_created VARCHAR(100))\;");
    database.query("CREATE TABLE IF NOT EXISTS locations (id SERIAL PRIMARY KEY NOT NULL, latitude FLOAT NOT NULL, longitude FLOAT NOT NULL, date_created VARCHAR(100), date_update VARCHAR(100))\;");
}