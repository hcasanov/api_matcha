const Joi = require('@hapi/joi');
const pg = require('pg');

const config = {
    user: process.env.SQL_USER,
    host: process.env.SQL_HOST,
    database: process.env.SQL_DATABASE,
    port: process.env.SQL_PORT
};
const pool = new pg.Pool(config);

module.exports = {
    ValidationError: function (message) {
        const Schema = Joi.object().keys({
            'login': Joi.string().min(2).max(50).required(),
            'name': Joi.string().min(2).max(15).required(),
            'firstname': Joi.string().min(2).max(15).required(),
            'mail': Joi.string().email({ minDomainSegments: 2 }).required(),
            'passwd': Joi.string().pattern(new RegExp('^(?=.*[A-Z])')).required(), // Min 5 caracteres, min 1 alpha, min 1 num
            'repeatPasswd': Joi.ref('passwd'),
            'gender': Joi.string(),
            'dateBirth': Joi.required(),
        })
        return Schema.validate(message);
    },
    ValidationErrorParam: function (message) {
        const Schema = Joi.object().keys({
            '_id': Joi.string(),
            'login': Joi.string().min(2).max(50),
            'name': Joi.string().min(2).max(15),
            'firstname': Joi.string().min(2).max(15),
            'mail': Joi.string().email({ minDomainSegments: 2 }),
            'passwd': Joi.string().pattern(new RegExp('^(?=.*[A-Z])')), // Min 5 caracteres, min 1 alpha, min 1 num
            'repeatPasswd': Joi.ref('passwd'),
            'dateBirth': Joi.date(),
            'description': Joi.string(),
            'picturesProfilePicture': Joi.string(),
            'picturesOtherPictures': Joi.string(),
        })
        return Schema.validate(message);
    },
    ValidationErrorPasswd: function (message) {
        const Schema = Joi.object().keys({
            '_id': Joi.string(),
            'oldPasswd': Joi.string().pattern(new RegExp('^(?=.*[A-Z])')).required(),
            'newPasswd': Joi.string().pattern(new RegExp('^(?=.*[A-Z])')).required(),
            'repeatNewPasswd': Joi.string().pattern(new RegExp('^(?=.*[A-Z])')).required(),
        })
        return Schema.validate(message);
    },
    ValidationResearchParameters: function(message) {
        const Schema = Joi.object().keys({
            '_id': Joi.string(),
            'hashtags': Joi.string().required(),
            'perimeter': Joi.number().required(),
            'ageMin': Joi.number().required(),
            'ageMax': Joi.number().required(),
            'gender': Joi.string().required()
        })
        return Schema.validate(message);
    },
    ValidationErrorLogin: function (message) {
        const Schema = Joi.object().keys({
            'mail': Joi.string().email({ minDomainSegments: 2 }).required(),
            'passwd': Joi.string().required()
        })
        return Schema.validate(message);
    },
    isAdult: function (date) {
        var ynew = new Date(date).getFullYear();
        var ynow = new Date().getFullYear();

        if ((ynow - ynew) > 18)
            return (true);
        else
            return (false);
    },
    checkPasswd: function (passwd, repeatPasswd) {
        if (passwd === repeatPasswd)
            return (true);
        else
            return (false);
    },
    getAge: function (birth) {
        var birth = new Date(birth);
        return new Number(Number.parseInt((new Date() - birth) / 31536000000));
    },
    arrayHashtags: function (req) {
        return (req.split(','));
    },
    accountExist: function(mail, callback){
        pool.connect(function(err, client, done){
            client.query("SELECT id FROM accounts WHERE mail = \'" + mail + "\';", (err, result) => {
                done();
                if (err){
                    console.log(err);
                }
                else if (result.rows[0] == undefined)
                    callback(false);
                else
                    callback(true);
            })
        })
    }
}   