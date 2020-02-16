const fs = require('fs');

const PATHTOPUBLIC = '../front/public';

module.exports = {
  folderChecker: function(form) {
    if (!fs.existsSync(PATHTOPUBLIC + '/tmp')) {
      fs.mkdirSync(PATHTOPUBLIC + '/tmp');
    }
    if (!fs.existsSync(PATHTOPUBLIC + '/profilePictures')) {
      fs.mkdirSync(PATHTOPUBLIC + '/profilePictures');
    }
  },
  checkType: function(firstname, id, dataType) {
    uniqueId = Date.now();
    if (dataType === "image/jpeg") {
      return firstname + id + uniqueId + '.jpeg';
    } else if (dataType === "image/png") {
      return firstname + id + uniqueId + '.png';
    } else if (dataType === "image/gif") {
      return firstname + id + uniqueId + '.gif';
    } else {
      return -1;
    }
  },
  removePicture: function(path) {
    if (fs.existsSync(path)) {
      fs.unlinkSync(path), (error) => {
        return -1;
      }
    }
  }
}