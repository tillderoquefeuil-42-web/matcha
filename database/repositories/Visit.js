const queryEx = require('../query');
const parser = require('../parser');
const Visit = require('../models/Visit');
const time = require('../../controllers/utils/time');


const type = 'visit';

parser.setSingle(type, function(record){
    return parseOneRecord(record);
});

function parseOneRecord(record){

    let entity;
    let node = record.get('v');

    let params = {};

    if (record.has('u')){
        params.user = record.get('u');
    }

    if (record.has('h')){
        params.host = record.get('h');
    }

    entity = new Visit(node, params);

    return entity;
}


let VisitRepository = {

    add         : function(userId, hostId){

        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u:User), (h:User)
                WHERE ID(u)=${userId} AND ID(h)=${hostId}
                CREATE (u)-[v:VISIT $visit]->(h)
                RETURN v, u, h
            `;

            let params = {
                visit   : {
                    date    : time.toDatetime(new Date(), true)
                }
            };

            queryEx.exec(query, params)
            .then(results => {
                return resolve(parser.records(results, type, true));
            }).catch(err => {
                return reject(err);
            });
        });
    },

    findByUser  : function(userId){
        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u:User)-[v:VISIT]->(h:User)
                WHERE ID(u)=${userId}
                RETURN v, u, h
            `;

            queryEx.exec(query)
            .then(results => {
                return resolve(parser.records(results, type));
            }).catch(err => {
                return reject(err);
            });
        });
    }

};

module.exports = VisitRepository;