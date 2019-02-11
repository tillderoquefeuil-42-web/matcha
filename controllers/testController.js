const moment = require('moment');

const queryEx = require('../database/query');
const config = require('../config/config');
const account = require('./account/test');
const chat = require('./chat/lib.js');
const Files = require('./utils/files');

const firstNamesM = [
    'John', 'Robert', 'Gregory', 'Oliver', 'Harry',
    'George', 'James', 'Jack', 'Noah', 'Edward',
    'Liam', 'Jacob', 'Benjamin', 'William', 'Jules'
];

const firstNamesF = [
    'Gaelle', 'Lucy', 'Elsa', 'Olivia', 'Amelia',
    'Isla', 'Emily', 'Grace', 'Charlotte', 'Emma',
    'Ava', 'Mia', 'Louise', 'Jade', 'Lucia'
];

const lastNames = [
    'Smith', 'Garcia', 'Martin', 'Rossi', 'Novak',
    'Fernandez', 'Smirnov', 'Silva', 'Mohamed', 'Kumar',
    'Gonzalez', 'Muller', 'Cohen', 'Nguyen', 'Khan',
    'Rodriguez', 'Wang', 'Anderson', 'Yilmaz', 'Traore',
    'Ivanov', 'Ahmed', 'Lopez', 'Kim', 'Papadopoulos',
    'Dupont', 'Martin', 'Laval', 'Pale', 'Duchemin'
];

const genders = ['male', 'female', 'other'];
const orientations = ['male', 'female', 'other'];

function reindexArray(array){
    let a = [];

    for (let i in array){
        if (array[i]){
            a.push(array[i]);
        }
    }

    return a;
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

        let firstNames = [firstNamesM, firstNamesF];

        for (let i in lastNames){
            let random = Math.round((Math.random())*100);

            let lastname = lastNames[i];

            let j = i%2;
            let index = random % firstNames[j].length;
            let firstname = firstNames[j][index];

            delete firstNames[j][index];
            firstNames[j] = reindexArray(firstNames[j]);

            let username = (firstname + '.' + lastname).toLowerCase();

            let age = config.params.MIN_AGED_USERS + random % 10;

            let user = {
                firstname   : firstname,
                lastname    : lastname,
                username    : username,
                email       : 'tillderoquefeuil+' + username + '@gmail.com',
                password    : 'MyWebSite42!',
                language    : 'en',
                gender      : genders[j],
                birthday    : parseInt(moment().subtract(age, 'years').format('x')),
                orientation : orientations[random % 3]
            };

            account.createTestAccount(user)
            .then(user => {
                if (parseInt(i) === parseInt(lastNames.length - 1)){
                    res.redirect('/');
                }
            }).catch(err => {
                console.log(err);
                return res.status(500).json({result:'ERROR'});
            });
        }
    });
}