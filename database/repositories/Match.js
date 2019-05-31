const queryEx = require('../query');
const parser = require('../parser');
const Match = require('../models/Match');

const type = 'match';

parser.setSingle(type, function(record){
    return parseOneRecord(record);
});

function parseOneRecord(record){

    let entity;
    let node = record.get('m');

    let params = {
        rel_user    : record.get('ru'),
        rel_partner : record.get('rp')
    }

    entity = new Match(node, params);
    return entity;
}


let MatchRepository = {

    mergeMatch  : function(user, partner_id){
        return new Promise((resolve, reject) => {
            let query = `
                MERGE (id:UniqueId {name:'${type}'})
                ON CREATE SET id.count = 1

                WITH id
                MATCH (u:User {uid:${user._id}}), (p:User {uid:${partner_id}})

                MERGE (u)-[ru:RELATION]->(m:Match)<-[rp:RELATION]-(p)
                ON CREATE SET id.count = id.count + 1,
                m.uid = id.count,
                m.blocked = FALSE,
                ru = {see:TRUE, like:FALSE, report:FALSE},
                rp = {see:FALSE, like:FALSE, report:FALSE}
                ON MATCH SET ru.see = TRUE

                RETURN m, ru, rp
            `;

            queryEx.exec(query)
            .then(results => {
                return resolve(parser.records(results, type, true));
            }).catch(err => {
                return reject(err);
            });
        });
    },

    likeMatch   : function(user, partner_id, like){
        return new Promise((resolve, reject) => {
            let query = `
                MATCH (u:User {uid:${user._id}})-[ru:RELATION]->(m:Match)<-[rp:RELATION]-(p:User {uid:${partner_id}})
                SET ru.like = ${like}

                RETURN m, ru, rp
            `;

            queryEx.exec(query)
            .then(results => {
                return resolve(parser.records(results, type, true));
            }).catch(err => {
                return reject(err);
            });
        });
    },

    blockMatch  : function(user, partner_id){
        return new Promise((resolve, reject) => {
            let query = `
                MATCH (u:User {uid:${user._id}})-[ru:RELATION]->(m:Match)<-[rp:RELATION]-(p:User {uid:${partner_id}})
                SET m.blocked = TRUE

                RETURN m, ru, rp
            `;

            queryEx.exec(query)
            .then(results => {
                return resolve(parser.records(results, type, true));
            }).catch(err => {
                return reject(err);
            });
        });
    },

    reportMatch : function(user, partner_id){
        return new Promise((resolve, reject) => {
            let query = `
                MATCH (u:User {uid:${user._id}})-[ru:RELATION]->(m:Match)<-[rp:RELATION]-(p:User {uid:${partner_id}})
                SET ru.block = TRUE

                RETURN m, ru, rp
            `;

            queryEx.exec(query)
            .then(results => {
                return resolve(parser.records(results, type, true));
            }).catch(err => {
                return reject(err);
            });
        });
    }



};

module.exports = MatchRepository;