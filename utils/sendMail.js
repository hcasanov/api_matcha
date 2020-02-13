var nodemailer = require('nodemailer');  
 var xoauth2 = require('xoauth2');

 module.exports = function(token_confirm, req, res){  
   // login  
   var transporter = nodemailer.createTransport({  
    host: "smtp.gmail.com",  
     auth: {  
       xoauth2: xoauth2.createXOAuth2Generator({  
         user: 'noelledeur@gmail.com',  
         clientId: '18366223812-ngjng2aind4cnt1nsj6u0u7jo8e03dpm.apps.googleusercontent.com',  
         clientSecret: 'NbVWbPo_6u8NhG2yqjRzZ3_Q',  
         accesToken: 'ya29.Il-8B7NrKUm2whiDYgFoozoVaTLtOG8PLWTiazaCBxoAMw_XZBjjYvbF2jw67G89ixpisADIKiqQeEcP6_FUH8wP36A76zpRDiEaFC0kVbkwRq-SmZJWFYZBJJU-UL7NkQ'
       })  
     }  
   });  
   console.log(transporter)
   var message = {  
       from: 'noelledeur@gmail.com', // sender address  
       to: req.body.mail, // list of receivers  
       subject: "Confirmation inscription matcha", // Subject line  
       text: "Veuiller cliquer sur le lien pour confirmer votre compte : " + token_confirm,// plaintext body
       html: '<b>Contact Nom</b>: ' + req.body.name + '<br/><b>Contact Email</b>: ' + req.body.mail + '<br/><b>Contact Sujet</b>: Inscription matcha<br/><br/>' // html body  
   }    
     // send mail with defined transport object  
     transporter.sendMail(message, function(error, info){  
       if(error){  
         console.log(error);  
         res.status(500).send('Internal Server Error (Mail)')         
       }    
       else{  
         res.statu(201).send('Created')  
       }     
     });  
 };  