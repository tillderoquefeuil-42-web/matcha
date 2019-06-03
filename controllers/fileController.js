const fs = require('fs');

const account = require('./account/lib.js');
const Files = require('./utils/files.js');

module.exports = function (app) {

    let user = null;
    let file = null;

    app.use(function(req, res, next){

        if (!req.query._t){
            return next();
        }

        let token = req.query._t;
        account.getUserFromToken(token)
        .then(_user => {
            user = _user;
            return next();
        }).catch(err => {
            return next();
        });
    })
    
    app.use(function(req, res, next){

        if (!req.query.filename || !user){
            return next();
        }
        
        Files.userHasRightToSee(req.query.filename, user)
        .then(_file => {
            file = _file;
            return next();
        }).catch(err => {
            console.log(err)
            return next();
        });
    })

    app.get('/private', function(req, res){

        if (!file || !user){
            res.writeHead(501, 'Oops');
            res.write('501: Missing argument!');
            return res.end();
        }

        let filepath = Files.getPrivateFilePath(file.filename);
        var stream = fs.createReadStream(filepath);

        // Handle non-existent file
        stream.on('error', function(error) {
            res.writeHead(404, 'Not Found');
            res.write('404: File Not Found!');
            return res.end();
        });

        // File exists, stream it to user
        res.statusCode = 200;
        stream.pipe(res);
    });

    app.get('/public', function(req, res){
        if (!req.query.filename){
            res.writeHead(501, 'Oops');
            res.write('501: Missing argument!');
            return res.end();
        }

        let filepath = Files.getPublicFilePath(req.query.filename);
        var stream = fs.createReadStream(filepath);

        // Handle non-existent file
        stream.on('error', function(error) {
            res.writeHead(404, 'Not Found');
            res.write('404: File Not Found!');
            return res.end();
        });

        // File exists, stream it to user
        res.statusCode = 200;
        stream.pipe(res);
    });
}