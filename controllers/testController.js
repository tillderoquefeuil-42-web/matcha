
const queryEx = require('../database/query');
const config = require('../config/config');
const account = require('./test/test');
const chat = require('./chat/lib.js');
const Files = require('./utils/files');

const TagRepo = require('../database/repositories/tag.js');
let requests = {};

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

    app.get('/createUsers', function(req, res){
        if (requests[req.url]){
            return res.redirect('/');
        }
        requests[req.url] = true;

        console.log('Create fake users');
        let max = parseInt(req.query.max);
        max = (!max)? 500 : max;

        let data = {
            max         : max,
            lastNames   : account.getLastNames(),
            firstNames  : account.getFirstNames()
        }

        account.createRecursive(data, 0)
        .then(result => {
            requests[req.url] = false;
            return res.redirect('/');
        }).catch(err => {
            requests[req.url] = false;
            console.log(err);
            return res.status(500).json({result:'ERROR', err:err});
        });
    });

    app.get('/randomMatching', function(req, res){
        if (requests[req.url]){
            return res.redirect('/');
        }
        requests[req.url] = true;

        console.log('Matching');
        account.getFakeProfiles()
        .then(fakes => {
            account.matchingRecursive(fakes, 0)
            .then(result => {
                requests[req.url] = false;
                return res.redirect('/');
            });
        }).catch(err => {
            requests[req.url] = false;
            console.log(err);
            return res.status(500).json({result:'ERROR', err:err});
        });

    });
}