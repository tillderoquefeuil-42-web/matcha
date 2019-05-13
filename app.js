const express = require("express");
const bodyParser = require('body-parser');

const config = require('./config/config');

const app = express();
let router = express.Router();

const server = app.listen(config.server.port, () => console.log(`Server on: http://${config.server.hostname}:${config.server.port}/`));

// const clients = [];

// BODYPARSER
var urlencodedParser = bodyParser.urlencoded({extended:true});
app.use(urlencodedParser);
app.use(bodyParser.json());

// CORS
app.use(function (req, res, next) {
    let allowedOrigins = ['http://localhost:3000', 'http://10.12.2.16:3000'];

    let origin = req.headers.origin;
    if (allowedOrigins.indexOf(origin) > -1){
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// GET USER by (query/body) token AND SET REQ.USER
require(__dirname + '/controllers/identityController')(router);

// SOCKET.IO MANAGEMENT
require(__dirname + '/controllers/socketController')(router, server);

// USER
app.use('/user', router);
require(__dirname + '/controllers/userController')(router);

// AUTH
app.use('/auth', router);
require(__dirname + '/controllers/authController')(router);

// FILE
app.use('/file', router);
require(__dirname + '/controllers/fileController')(router);

// TEST
app.use('/test', router);
require(__dirname + '/controllers/testController')(router);

// TRANSLATIONS
app.use('/translations', router);
require(__dirname + '/controllers/transController')(router);

app.get('/', function(req, res){
    res.send(`
        <h2>Welcome on server side</h2>

        Run <a href="/test/createUsers">/test/createUsers</a> (100 by default)<br />
        Run <a href="/test/createConv?userA=X&userB=Y">/test/createConv</a><br />
        Run <a href="/test/reset">/test/reset</a><br />
    `);
});
