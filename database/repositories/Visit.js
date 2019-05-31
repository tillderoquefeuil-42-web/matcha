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
                MERGE (id:UniqueId {name:'${type}'})
                ON CREATE SET id.count = 1
                ON MATCH SET id.count = id.count + 1

                WITH id.count AS uid
                MATCH (u:User {uid:${userId}}), (h:User {uid:${hostId}})
                CREATE (u)-[v:VISIT $visit]->(h)
                SET v.uid = uid
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
                MATCH (u:User {uid:${user._id}})-[v:VISIT]->(h:User)
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