module.exports = {
    init: () => {
        init_query = "CREATE TABLE accounts (id SERIAL PRIMARY KEY NOT NULL, name VARCHAR (50) NOT NULL, firstname VARCHAR (50) NOT NULL, mail VARCHAR (50) NOT NULL, passwd VARCHAR (255) NOT NULL, datebirth TIMESTAMP NOT NULL, age SMALLINT, gender VARCHAR (10), description TEXT, research_age_min SMALLINT, research_age_max SMALLINT, research_gender VARCHAR(10), online BOOLEAN, blocked BOOLEAN default false, date_created TIMESTAMP, date_update TIMESTAMP, token VARCHAR(255) default null)\;";
        return (init_query);
    }   
}