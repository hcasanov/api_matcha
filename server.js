const express = require('express');
const body = require('body-parser');
var cors = require('cors');
const myRouter = require('./apiRouter').router;

require('dotenv').config();

// Set extensions
let app = express();

// Start server
app.use(body.urlencoded({extended: true}))
app.use(body.json())
app.use('/', myRouter)
app.use(cors());
app.listen(process.env.LISTEN_PORT)