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
    database.query("CREATE TABLE IF NOT EXISTS accounts (id SERIAL PRIMARY KEY NOT NULL, login VARCHAR(50), name VARCHAR(50) NOT NULL, firstname VARCHAR(50) NOT NULL, mail VARCHAR(50) NOT NULL, passwd VARCHAR(255) NOT NULL, datebirth VARCHAR(100) NOT NULL, age SMALLINT, gender VARCHAR(10), description TEXT, hashtags TEXT, research_perimeter INT default 20, research_age_min SMALLINT, research_age_max SMALLINT, research_gender VARCHAR(10), research_hashtags TEXT, online BOOLEAN default false, last_connection VARCHAR(200), blocked BOOLEAN default false, date_created VARCHAR(100), date_update VARCHAR(100), token VARCHAR(255) default null, confirm BOOLEAN, token_confirm VARCHAR(100))\;");
    database.query("CREATE TABLE IF NOT EXISTS pictures (id SERIAL PRIMARY KEY NOT NULL, id_account SMALLINT, url VARCHAR(255), file_name VARCHAR(100), profile_picture BOOLEAN default false, date_created VARCHAR(100))\;");
    database.query("CREATE TABLE IF NOT EXISTS locations (id SERIAL PRIMARY KEY NOT NULL, latitude FLOAT NOT NULL, longitude FLOAT NOT NULL, date_created VARCHAR(100), date_update VARCHAR(100))\;");
    database.query("CREATE TABLE IF NOT EXISTS notifications (id SERIAL PRIMARY KEY NOT NULL, type VARCHAR(50), like_id INT, chat_id INT, match_id INT, name VARCHAR(150), message TEXT, from_id INT, to_id INT, status BOOLEAN, date_created VARCHAR(100), date_update VARCHAR(100))\;");
    database.query("CREATE TABLE IF NOT EXISTS likes (id SERIAL PRIMARY KEY NOT NULL, from_id INT, to_id INT, date_created VARCHAR(100), status BOOLEAN)\;");
    database.query("CREATE TABLE IF NOT EXISTS matchs (id SERIAL PRIMARY KEY NOT NULL, from_id INT, to_id INT, date_created VARCHAR(100), status BOOLEAN)\;");
    database.query("CREATE TABLE IF NOT EXISTS chats (id SERIAL PRIMARY KEY NOT NULL, from_id INT, to_id INT, message TEXT, date_created VARCHAR(100))\;");

}

function create_users (){
    console.log('Creation users...')
    var i = 500;
    var dateBirth = "12/12/12";

    while (i) {
        var age = Math.floor(Math.random() * (30 - 20 + 1)) + 18;
        var research_age_max = Math.floor(Math.random() * (30 - 25 + 1)) + 25;
        var research_age_min = Math.floor(Math.random() * (24 - 18 + 1)) + 18;
        
        if ((i % 2) === 0)
            var gender = 'F';
        else
            var gender = 'M';

        if ((i % 7) === 0)
            var research_gender = 'A';
        else if ((i % 10) === 0)
            var research_gender = 'M';
        else if ((i % 2) === 0)
            var research_gender = 'M';
        else
            var research_gender = 'F';

        if ((i % 3) === 0)
            var gender = 'F'
        else
            var gender = 'M'

        database.query("INSERT INTO accounts (login, name, firstname, mail, passwd, dateBirth, age, gender, description, hashtags, research_age_min, research_age_max, research_gender, date_created, date_update, confirm) VALUES (" + i + ", " + i + ", " + i + ", \'" + i + "@gmail.com\', \'" + i + "Test12\', " + dateBirth + ", " + age + ", \'" + gender + "\', 'Mauris pretium molestie enim, tincidunt volutpat ligula accumsan at. Donec ullamcorper hendrerit dapibus. Integer feugiat in nisi vel maximus. Aliquam erat volutpat. Suspendisse potenti. Ut ultrices maximus lobortis', 'cuise,sport,code,foot', " + research_age_min + ", " + research_age_max + ", \'" + research_gender + "\', " + dateBirth + ", " + dateBirth + ", true)");
        i--;
    }
    if (i == 0)
        return console.log('Users created')
}