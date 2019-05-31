const queryEx = require('../query');
const parser = require('../parser');
const Event = require('../models/Event');
const time = require('../../controllers/utils/time');


const type = 'event';

parser.setSingle(type, function(record){
    return parseOneRecord(record);
});

function parseOneRecord(record){

    let entity;
    let node = record.get('e');

    let params = {};

    if (record.has('u')){
        params.user = record.get('u');
    }

    if (record.has('f')){
        params.partner_picture = record.get('f');
    }

    entity = new Event(node, params);

    return entity;
}


let EventRepository = {

    add                 : function(userId, partnerId, eventType){

        return new Promise((resolve, reject) => {

            let query = `
                MERGE (id:UniqueId {name:'${type}'})
                ON CREATE SET id.count = 1
                ON MATCH SET id.count = id.count + 1

                WITH id.count AS uid
                MATCH (u:User {uid:${userId}}), (p:User {uid:${partnerId}})
                CREATE (u)-[e:EVENT $event]->(p)
                SET e.uid = uid

                WITH u, e, p
                OPTIONAL MATCH (u)-[pp:PROFILE_PIC {current:true}]->(f:File)
                RETURN u, f, e{
                    .*, partner_id:u.uid, partner_label:u.firstname
                }
            `;
            
            let params = {
                event   : {
                    date    : time.toDatetime(new Date(), true),
                    read    : false,
                    type    : eventType
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

    findByUser          : function(userId, all){
        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u:User {uid:${userId}})<-[e:EVENT]-(p:User)

                OPTIONAL MATCH (p)-[pp:PROFILE_PIC {current:true}]->(f:File)
                RETURN u, f, e{
                    .*, partner_id:p.uid, partner_label:p.firstname
                }

                ORDER BY e.date DESC
                ${ all? '' : 'LIMIT 25' }
            `;

            queryEx.exec(query)
            .then(results => {
                return resolve(parser.records(results, type));
            }).catch(err => {
                return reject(err);
            });
        });
    },

    setReadEventsByUser : function(userId, all){
        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u:User {uid:${userId}})<-[e:EVENT]-(p:User)

                SET e.read = TRUE

                WITH u, e, p
                OPTIONAL MATCH (p)-[pp:PROFILE_PIC {current:true}]->(f:File)

                RETURN u, f, e{
                    .*, partner_id:p.uid, partner_label:p.firstname
                }

                ORDER BY e.date DESC
                ${ all? '' : 'LIMIT 25' }
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

module.exports = EventRepository;