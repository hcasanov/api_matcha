const database = require('./db');

database.query("DROP TABLE IF EXISTS accounts;");
database.query("DROP TABLE IF EXISTS pictures;");
database.query("DROP TABLE IF EXISTS locations;");
database.query("DROP TABLE IF EXISTS notifications;");
database.query("DROP TABLE IF EXISTS chats;");
database.query("DROP TABLE IF EXISTS likes;");
database.query("DROP TABLE IF EXISTS matchs;");
setTimeout(init, 2000);

setTimeout(create_users, 2000);

setTimeout(exit, 3000);

function exit(){
    console.log('Database initialized !');
    process.exit();
}

function init(){
    database.query("CREATE TABLE IF NOT EXISTS accounts (id SERIAL PRIMARY KEY NOT NULL, name VARCHAR(50) NOT NULL, firstname VARCHAR(50) NOT NULL, mail VARCHAR(50) NOT NULL, passwd VARCHAR(255) NOT NULL, datebirth VARCHAR(100) NOT NULL, age SMALLINT, gender VARCHAR(10), description TEXT, hashtags TEXT, research_age_min SMALLINT, research_age_max SMALLINT, research_gender VARCHAR(10), research_hashtags TEXT, online BOOLEAN, blocked BOOLEAN default false, date_created VARCHAR(100), date_update VARCHAR(100), token VARCHAR(255) default null, confirm BOOLEAN, token_confirm VARCHAR(100))\;");
    database.query("CREATE TABLE IF NOT EXISTS pictures (id SERIAL PRIMARY KEY NOT NULL, id_account SMALLINT, url_picture VARCHAR(255), file_name VARCHAR(100), date_created VARCHAR(100))\;");
    database.query("CREATE TABLE IF NOT EXISTS locations (id SERIAL PRIMARY KEY NOT NULL, latitude FLOAT NOT NULL, longitude FLOAT NOT NULL, date_created VARCHAR(100), date_update VARCHAR(100))\;");
    database.query("CREATE TABLE IF NOT EXISTS notifications (id SERIAL PRIMARY KEY NOT NULL, type VARCHAR(50), like_id INT, chat_id INT, match_id INT, name VARCHAR(150), message TEXT, from_id INT, to_id INT, status BOOLEAN, date_created VARCHAR(100), date_update VARCHAR(100))\;");
    database.query("CREATE TABLE IF NOT EXISTS likes (id SERIAL PRIMARY KEY NOT NULL, from_id INT, to_id INT, date_created VARCHAR(100), status BOOLEAN)\;");
    database.query("CREATE TABLE IF NOT EXISTS matchs (id SERIAL PRIMARY KEY NOT NULL, from_id INT, to_id INT, date_created VARCHAR(100), status BOOLEAN)\;");
}

function create_users (){
    console.log('Creation users...')
    var i = 500;
    var dateBirth = "12/12/12";

    while (i) {
        database.query("INSERT INTO accounts (name, firstname, mail, passwd, dateBirth, age, gender, description, hashtags, research_age_min, research_age_max, research_gender, date_created, date_update, confirm) VALUES (" + i + ", " + i + ", \'" + i + "@gmail.com\', \'" + i + "Test12\', " + dateBirth + ", 22, 'F', 'Mauris pretium molestie enim, tincidunt volutpat ligula accumsan at. Donec ullamcorper hendrerit dapibus. Integer feugiat in nisi vel maximus. Aliquam erat volutpat. Suspendisse potenti. Ut ultrices maximus lobortis', 'cuise,sport,code,foot', 20, 24, 'F', " + dateBirth + ", " + dateBirth + ", true)");
        i--;
    }
    if (i == 0)
        return console.log('Users created')
}