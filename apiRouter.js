var express = require('express');
var Accounts = require('./routes/accounts');

exports.router = (function() {
    var myRouter = express.Router();

    myRouter.route('/accounts/register/').post(Accounts.register);// Create account
    myRouter.route('/accounts/login/').post(Accounts.register);
    myRouter.route('/accounts/name/').put(Accounts.name);
    myRouter.route('/accounts/firstname/').put(Accounts.firstname);
    myRouter.route('/accounts/mail/').put(Accounts.mail);
    myRouter.route('/accounts/passwd/').put(Accounts.passwd);
    myRouter.route('/accounts/datebirth/').put(Accounts.dateBirth);
    myRouter.route('/accounts/gender/').put(Accounts.gender);
    myRouter.route('/accounts/description/').put(Accounts.description);
    myRouter.route('/accounts/pictures/').put(Accounts.pictures);
    myRouter.route('/accounts/hashtags/').put(Accounts.hashtags);
    myRouter.route('/accounts/research/hashtags/').put(Accounts.research_hashtags);
    myRouter.route('/accounts/research/mylatitude/').put(Accounts.research_myLatitude);
    myRouter.route('/accounts/research/mylongitude/').put(Accounts.research_myLongitude);
    myRouter.route('/accounts/research/perimeter/').put(Accounts.research_perimeter);
    myRouter.route('/accounts/research/gender/').put(Accounts.research_gender);
    myRouter.route('/accounts/research/agemin/').put(Accounts.research_ageMin);
    myRouter.route('/accounts/research/agemax/').put(Accounts.delete);
    myRouter.route('/delete/accounts/').delete(Accounts.delete);

    return myRouter;
})();