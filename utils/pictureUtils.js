const fs = require('fs');

const PATHTOPUBLIC = '../front/public';

module.exports = {
  folderChecker: function(form) {
    if (!fs.existsSync(PATHTOPUBLIC + '/tmp')) {
      fs.mkdirSync(PATHTOPUBLIC + '/tmp');
    }
    if (!fs.existsSync(PATHTOPUBLIC + '/profilePictures')) {
      fs.mkdirSync(PATHTOPUBLIC + '/profilePictures');
    }
    if (!fs.existsSync(PATHTOPUBLIC + '/pictures')) {
      fs.mkdirSync(PATHTOPUBLIC + '/pictures');
    }
  },
  checkType: function(login, id, dataType) {
    uniqueId = Date.now();
    if (dataType === "image/jpeg") {
      return login + id + uniqueId + '.jpeg';
    } else if (dataType === "image/png") {
      return login + id + uniqueId + '.png';
    } else if (dataType === "image/gif") {
      return login + id + uniqueId + '.gif';
    } else {
      return -1;
    }
  },
  removePicture: function(path) {
    if (fs.existsSync(path)) {
      fs.unlinkSync(path), (error) => {
        return -1;
      }
    }
  }
}