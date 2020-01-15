const Joi = require('@hapi/joi');

module.exports = {
    ValidationError: function (message) {
        const Schema = Joi.object().keys({
            'name': Joi.string().min(2).max(15).required(),
            'firstname': Joi.string().min(2).max(15).required(),
            'mail': Joi.string().email({ minDomainSegments: 2 }).required(),
            'passwd': Joi.string().pattern(new RegExp('^(?=.*[A-Z])')).required(), // Min 5 caracteres, min 1 alpha, min 1 num
            'repeatPasswd': Joi.ref('passwd'),
            'dateBirth': Joi.required(),
            'gender': Joi.string().required(),
            'description': Joi.string().required(),
            'picturesProfilePicture': Joi.required(),
            'picturesOtherPictures': Joi.required(),
            'researchParametersHastags': Joi.required(),
            'researchParametersPerimeter': Joi.required(),
            'researchParametersMyLatitude': Joi.required(),
            'researchParametersMyLongitude': Joi.required(),
            'researchParametersAgeMin': Joi.number().integer().required(),
            'researchParametersAgeMax': Joi.number().integer().required(),
            'researchParametersGender': Joi.required(),
            'metaOnline': Joi.required()
        })
        return Schema.validate(message);
    },
    ValidationErrorParam: function (message) {
        const Schema = Joi.object().keys({
            '_id': Joi.string(),
            'name': Joi.string().min(2).max(15),
            'firstname': Joi.string().min(2).max(15),
            'mail': Joi.string().email({ minDomainSegments: 2 }),
            'passwd': Joi.string().pattern(new RegExp('^(?=.*[A-Z])')), // Min 5 caracteres, min 1 alpha, min 1 num
            'repeatPasswd': Joi.ref('passwd'),
            'dateBirth': Joi.date(),
            'gender': Joi.string(),
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
            'passwd': Joi.string().required(),
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
    }
}