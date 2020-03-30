
const socketIo = require('socket.io');

const ioObj = {}

ioObj.initSocket = (server) => {
  ioObj.io = socketIo(server);
  ioObj.io.on('connection', function(socket) {
    console.log('new connection');
    socket.on('join', room => {
      socket.join(room, () => {
        console.log('USR joined room: ' + room);
      });
    });
  });
}
module.exports = {
  ioObj
}