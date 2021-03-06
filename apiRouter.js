const express = require('express');
const Accounts = require('./routes/accounts');
const Locations = require('./routes/location');
const Pictures = require('./routes/pictures');
const Notifications = require('./routes/notifications');
const Chats = require('./routes/chats');
const Likes = require('./routes/likes');
const Cibles = require('./routes/cible');
const Matchs = require('./routes/matchs')

exports.router = (function() {
    var myRouter = express.Router();

    myRouter.route('/accounts/register/').post(Accounts.register);// Create account
    myRouter.route('/accounts/login/').post(Accounts.login);
    myRouter.route('/accounts/userLogin/').put(Accounts.userLogin);
    myRouter.route('/accounts/name/').put(Accounts.name);
    myRouter.route('/accounts/firstname/').put(Accounts.firstname);
    myRouter.route('/accounts/mail/').put(Accounts.mail);
    myRouter.route('/accounts/passwd/').put(Accounts.passwd);
    myRouter.route('/accounts/datebirth/').put(Accounts.dateBirth);
    myRouter.route('/accounts/gender/').put(Accounts.gender);
    myRouter.route('/accounts/description/').put(Accounts.description);
    myRouter.route('/accounts/hashtags/').put(Accounts.hashtags);
    myRouter.route('/accounts/research/hashtags/').put(Accounts.research_hashtags);
    myRouter.route('/accounts/research/perimeter/').put(Accounts.research_perimeter);
    myRouter.route('/accounts/research/gender/').put(Accounts.research_gender);
    myRouter.route('/accounts/research/agemin/').put(Accounts.research_ageMin);
    myRouter.route('/accounts/research/agemax/').put(Accounts.research_ageMax);
    myRouter.route('/accounts/').delete(Accounts.delete);
    myRouter.route('/accounts/params').get(Accounts.get_params);
    myRouter.route('/accounts/confirm/:token').put(Accounts.confirm_register);
    myRouter.route('/accounts/forgotPasswd').post(Accounts.forgotPasswd);
    myRouter.route('/accounts/report').post(Accounts.report);
    myRouter.route('/accounts/block').post(Accounts.block);
    
    myRouter.route('/accounts/locations').put(Locations.put);
    myRouter.route('/accounts/locations').get(Locations.get);
    
    myRouter.route('/accounts/pictures').post(Pictures.post);
    myRouter.route('/accounts/pictures').get(Pictures.get);                         //get pictures except profile picture
    myRouter.route('/accounts/pictures').delete(Pictures.delete);
    myRouter.route('/accounts/profilePicture').post(Pictures.profilePicture);        //new function to add profile picture
    myRouter.route('/accounts/getProfilePicture').get(Pictures.getProfilePicture);
    
    
    myRouter.route('/notifications/like').post(Notifications.new_like);
    myRouter.route('/notifications/chat').post(Notifications.new_chat);
    myRouter.route('/notifications/match').post(Notifications.new_match);
    myRouter.route('/notifications/read').put(Notifications.read);
    myRouter.route('/notifications').get(Notifications.get);
    
    myRouter.route('/chats').post(Chats.post);
    myRouter.route('/chats').get(Chats.get);
    
    myRouter.route('/likes').post(Likes.post);
    
    myRouter.route('/matchs').get(Matchs.get);
    myRouter.route('/unmatch').post(Matchs.unmatch);

    myRouter.route('/cibles').get(Cibles.get);

    myRouter.route('/disconnect').post(Accounts.disconnect);

    return myRouter;
})();