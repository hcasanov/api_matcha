const express = require('express');
const body = require('body-parser');
var cors = require('cors');
const myRouter = require('./apiRouter').router;

require('dotenv').config();

// Set extensions
let app = express();



// Start server
app.use(cors());
app.use(body.urlencoded({extended: true}))
app.use(body.json())
app.use('/', myRouter)

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, DELETE, PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.listen(process.env.LISTEN_PORT)


// io socket
const server = require('http').Server(app)
const io = require('socket.io')(server);

io.on('connection', (socket) => {
    console.log('User connected')

    socket.on('disconnect'), () => {
        console.log('User disconnected')
    }
})