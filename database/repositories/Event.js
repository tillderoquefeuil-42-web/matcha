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
                MATCH (u:User), (p:User)

                WHERE ID(u)=${userId} AND ID(p)=${partnerId}
                CREATE (u)-[e:EVENT $event]->(p)

                WITH u, e, p
                OPTIONAL MATCH (u)-[pp:PROFILE_PIC {current:true}]->(f:File)
                RETURN u, f, e{
                    .*, _id:ID(e), partner_id:ID(u), partner_label:u.firstname
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
                MATCH (u:User)<-[e:EVENT]-(p:User)

                WHERE ID(u)=${userId}
                OPTIONAL MATCH (p)-[pp:PROFILE_PIC {current:true}]->(f:File)
                RETURN u, f, e{
                    .*, _id:ID(e), partner_id:ID(p), partner_label:p.firstname
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
                MATCH (u:User)<-[e:EVENT]-(p:User)
                WHERE ID(u)=${userId}

                SET e.read = TRUE

                WITH u, e, p
                OPTIONAL MATCH (p)-[pp:PROFILE_PIC {current:true}]->(f:File)

                RETURN u, f, e{
                    .*, _id:ID(e), partner_id:ID(p), partner_label:p.firstname
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