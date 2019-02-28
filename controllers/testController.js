
const queryEx = require('../database/query');
const config = require('../config/config');
const account = require('./account/test');
const chat = require('./chat/lib.js');
const Files = require('./utils/files');

const TagRepo = require('../database/repositories/tag.js');

function reindexArray(array){
    let a = [];

    for (let i in array){
        if (array[i]){
            a.push(array[i]);
        }
    }

    return a;
}

function random() {
    return Math.round((Math.random())*100);
}

module.exports = function (app) {

    app.get('/reset', function(req, res){

        let query = `MATCH (a) DETACH DELETE a`;
        queryEx.exec(query)
        .then(results => {
            Files.deleteAll();
            res.redirect('/');
        }).catch(err => {
            console.log(err);
            return res.status(500).json({result:'ERROR'});
        });

    });

    app.get('/createConv', function(req, res){

        if (!(parseInt(req.query.userA) >= 0 && parseInt(req.query.userB) >= 0)){
            return res.status(500).json({result:'Reload with usersId (?userA=X&userB=Y)'});
        }

        chat.fillConvMessage([parseInt(req.query.userA), parseInt(req.query.userB)])
        .then(message => {
            return res.redirect('/');
        }).catch(err => {
            console.log(err);
            return res.status(500).json({result:'ERROR'});
        });

    });

    app.get('/createUsers', function(req, res){

        let max = parseInt(req.query.max);
        max = (!max)? 100 : max;
        // max = (!max || max < 500)? 500 : max;

        let lastNames = account.getLastNames();
        let firstNames = account.getFirstNames();
        let count = 0;

        for (let i in lastNames){

            if (i >= max){
                break;
            }

            let r = random();
            let lastname = lastNames[i];

            let j = i%2;

            let index = r % firstNames[j].length;
            let firstname = firstNames[j][index];
            delete firstNames[j][index];
            firstNames[j] = reindexArray(firstNames[j]);

            let user = account.generateUser(firstname, lastname, j);
            account.manageOrientation(user);
            account.getRandomTags(user);
            account.getRandomCoords(user);

            account.createTestAccount(user)
            .then(user => {
                count++;
                if (count === (max - 1)){
                    return res.redirect('/');
                }
            }).catch(err => {
                console.log(err);
                return res.status(500).json({result:'ERROR'});
            });
        }
    });
}