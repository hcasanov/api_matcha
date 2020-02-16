const jwt_decode = require('jwt-decode');
const pg = require('pg');
const IncomingForm = require('formidable').IncomingForm;
const fs = require('fs');
const pictureUtils = require('../utils/pictureUtils');

const PATHTOPUBLIC = '../front/public';

const config = {
    user: process.env.SQL_USER,
    host: process.env.SQL_HOST,
    database: process.env.SQL_DATABASE,
    port: process.env.SQL_PORT
};
const pool = new pg.Pool(config);

module.exports = {
    post: function (req, res) {
        if (req.headers.token == undefined || req.body.url_picture == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(function (err, client, done) {
            var id = jwt_decode(req.headers.token).id;
            var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
            client.query(query, (err, result) => {
                if (err != null)
                    return res.status(500).send('Internal Server Error');
                else if (result.rows[0] === undefined)
                    return res.status(401).send('Unauthorized');
                else if (result.rows[0].token === req.headers.token) {
                    var date_created = new Date();
                    var url = req.body.url_picture;
                    var file_name = url.split('/').reverse();
                    var update_query = "INSERT INTO pictures (id_account, url_picture, file_name, date_created) VALUES (\'" + id + "\', \'" + req.body.url_picture + "\', \'" + file_name[0] + "\', \'" + date_created + "\');";
                    client.query(update_query, (err, result) => {
                        done();
                        if (err)
                            return res.status(500).send('Internal Server Error');
                        else
                            return res.status(200).send('OK');
                    })
                }
                else
                    return res.status(401).send('Unauthorized');
            })
        })
    },
    get: function (req, res) {
        if (req.headers.token == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(function (err, client, done) {
            var id = jwt_decode(req.headers.token).id;
            var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
            client.query(query, (err, result) => {
                if (err != null)
                    return res.status(500).send('Internal Server Error');
                else if (result.rows[0] === undefined)
                    return res.status(401).send('Unauthorized');
                else if (result.rows[0].token === req.headers.token) {
                    var update_query = "SELECT url_picture FROM pictures WHERE id_account = \'" + id + "\';";
                    client.query(update_query, (err, result) => {
                        done();
                        var pictures = result.rows;
                        if (err)
                            return res.status(500).send('Internal Server Error');
                        else
                            return res.status(200).json(pictures);
                    })
                }
                else
                    return res.status(401).send('Unauthorized');
            })
        })
    },
    delete: function (req, res) {
        if (req.headers.token == undefined || req.body.url_picture == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(function (err, client, done) {
            var id = jwt_decode(req.headers.token).id;
            var query = "SELECT token FROM accounts WHERE id = \'" + id + "\';";
            client.query(query, (err, result) => {
                if (err != null)
                    return res.status(500).send('Internal Server Error');
                else if (result.rows[0] === undefined)
                    return res.status(401).send('Unauthorized');
                else if (result.rows[0].token === req.headers.token) {
                    var update_query = "DELETE FROM pictures WHERE url_picture = \'" + req.body.url_picture + "\'";
                    client.query(update_query, (err, result) => {
                        done();
                        if (err)
                            return res.status(500).send('Internal Server Error');
                        else
                            return res.status(200).send('OK');
                    })
                }
                else
                    return res.status(401).send('Unauthorized');
            })
        })
    },
    profilePicture : function (req, res) {
      if (req.headers.token == undefined)
        return res.status(400).send('Bad Request');
      pool.connect(function (err, client, done) {
        var id = jwt_decode(req.headers.token).id;
        var query = "SELECT token, firstname FROM accounts WHERE id = \'" + id + "\';"; // need to get old profilePicture path
        client.query(query, (err, result) => {
          if (err != null)
              return res.status(500).send('Internal Server Error');
          else if (result.rows[0] === undefined)
              return res.status(401).send('Unauthorized');
          else if (result.rows[0].token === req.headers.token) {
            pictureUtils.folderChecker();
            var form = new IncomingForm();
            form.keepExtensions = true;
            form.uploadDir = PATHTOPUBLIC + '/tmp';
            form.parse(req);
            form.on('file', async (field, file) => {
              let newName = await pictureUtils.checkType(result.rows[0].firstname, id, file.type);
              if (newName <  0) {
                pictureUtils.removePicture(file.path);
                return res.status(400).send('Type error');
              } else {
                let newpath = PATHTOPUBLIC + '/photos/' + newName;
                await fs.rename(file.path, newpath, function (err) {
                  if (err) {
                    pictureUtils.removePicture(file.path);
                    return res.status(500).send('pathError');
                  } else {
                    if (pictureUtils.removePicture(PATHTOPUBLIC + result.rows[0].profilePicture) < 0) {
                      return res.status(500).send('fail to remove old picture');
                    }
                  }
                })
              }
              res.json();
            })
            // form.on('end', () => {
            //   // res.json();
            //   console.log(errors);
            //   if (errors.length) {
            //     return res.status(500).send(errors);
            //   } else {
            //     res.json();
            //   }
            // })
 
            // var update_query = "INSERT INTO pictures (id_account, url_picture, file_name, date_created) VALUES (\'" + id + "\', \'" + req.body.url_picture + "\', \'" + file_name[0] + "\', \'" + date_created + "\');";
            // client.query(update_query, (err, result) => {
            //   done();
            //   if (err)
            //     return res.status(500).send('Internal Server Error');
            //   else
            //     return res.status(200).send('OK');
            // })
          } else
              return res.status(401).send('Unauthorized');
        })
      })
    }
}