var nodemailer = require('nodemailer');
var xoauth2 = require('xoauth2');

module.exports = async function (token_confirm, req) {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: '4242matcha4242@gmail.com',
      pass: 'lemotdepasse111!'
    }
  });

  const mailOptions = {
    from: 'noelledeur@gmail.com', // sender address
    to: req.body.mail, // list of receivers
    subject: 'Confirme incscription Matcha', // Subject line
    html: "Veuiller cliquer sur le lien pour confirmer votre compte : <a href='http://localhost:3000/accounts/confirm/" + token_confirm + "'>cliquer_ici</a>",// plaintext body
  };

  const sendMail = await transporter.sendMail(mailOptions)
  console.log(sendMail)
  if (sendMail.error)
    console.log(sendMail.error)
  else
    return ("OK")

};  