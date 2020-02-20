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
  if (req.headers.token == undefined)
            return res.status(400).send('Bad Request');
        pool.connect(function (err, client, done) {
            var id = jwt_decode(req.headers.token).id;
            var query = "SELECT token, login FROM accounts WHERE id = \'" + id + "\';";
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
                      let newName = await pictureUtils.checkType(result.rows[0].login, id, file.type);
                      if (newName <  0) {
                        pictureUtils.removePicture(file.path);
                        return res.status(400).send('Type error');
                      } else {
                        let newpath = PATHTOPUBLIC + '/pictures/' + newName;
                        await fs.rename(file.path, newpath, function (err) {
                          if (err) {
                            pictureUtils.removePicture(file.path);
                            return res.status(500).send('pathError');
                          }
                        })
                    var date_created = new Date();
                    var update_query = "INSERT INTO pictures (id_account, url_picture, file_name, date_created) VALUES (\'" + id + "\', \'" + '/pictures/' + newName + "\', \'" + newName + "\', \'" + date_created + "\');";
                    client.query(update_query, (err, result) => {
                        done();
                        if (err)
                            return res.status(500).send('Internal Server Error');
                        else
                            return res.status(200).send('/pictures/' + newName);
                    })
                }
            })
          } else
            return res.status(401).send('Unauthorized');
        })
      })
    },
    profilePicture : function (req, res) {
      if (req.headers.token == undefined)
        return res.status(400).send('Bad Request');
      pool.connect(function (err, client, done) {
        var id = jwt_decode(req.headers.token).id;
        var query = "SELECT token, login FROM accounts WHERE id = \'" + id + "\';"; // need to get old profilePicture path
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
              let newName = await pictureUtils.checkType(result.rows[0].login, id, file.type);
              if (newName <  0) {
                pictureUtils.removePicture(file.path);
                return res.status(400).send('Type error');
              } else {
                let newpath = PATHTOPUBLIC + '/profilePictures/' + newName;
                await fs.rename(file.path, newpath, function (err) {
                  if (err) {
                    pictureUtils.removePicture(file.path);
                    return res.status(500).send('pathError');
                  }
                })
                var date_created = new Date();
                var update_query = "INSERT INTO pictures (id_account, url_picture, file_name, date_created, profile_picture) VALUES (\'" + id + "\', \'" + '/profilePictures/' + newName + "\', \'" + newName + "\', \'" + date_created + "\', TRUE);";
                client.query(update_query, (err, result) => {
                done();
                if (err)
                  return res.status(500).send('Internal Server Error');
                else
                  return res.status(200).send('/profilePictures/' + newName);
                })
              }
            })
          } else
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
                    var update_query = "SELECT url_picture FROM pictures WHERE id_account = \'" + id + "\' AND profile_picture = FALSE;";
                    client.query(update_query, (err, result) => {
                        done();
                        var pictures = [];
                        result.rows.map(picture => {
                          pictures.push(picture.url_picture);
                        })
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
    getProfilePicture: function (req, res) {
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
                  var update_query = "SELECT url_picture FROM pictures WHERE id_account = \'" + id + "\' AND profile_picture = TRUE;";
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
        if (req.headers.token == undefined || req.query.url_picture == undefined)
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
                    pictureUtils.removePicture(PATHTOPUBLIC + req.query.url_picture);
                    var update_query = "DELETE FROM pictures WHERE url_picture = \'" + req.query.url_picture + "\'";
                    client.query(update_query, (err, result) => {
                        done();
                        if (err)
                            return res.status(500).send('Internal Server Error');
                        else {
                            return res.status(200).send(req.query.url_picture);
                        }
                    })
                }
                else
                    return res.status(401).send('Unauthorized');
            })
        })
    }
}