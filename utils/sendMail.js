var nodemailer = require('nodemailer');  
 var xoauth2 = require('xoauth2');

 module.exports = function(token_confirm, req, callback){  
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
           user: 'noelledeur@gmail.com',
           pass: 'Lemotdepasseestmotdepasse'
       }
   });

   const mailOptions = {
    from: 'noelledeur@gmail.com', // sender address
    to: req.body.mail, // list of receivers
    subject: 'Confirme incscription Matcha', // Subject line
    html: "Veuiller cliquer sur le lien pour confirmer votre compte : <a href='http://localhost:3000/" + token_confirm + "'>cliquer_ici</a>",// plaintext body
  };

  transporter.sendMail(mailOptions, function (err, info) {
    if(err)
      console.log(err)
    else
      callback("OK")
 });

 };  