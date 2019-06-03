const parser = require('../parser');
const queryEx = require('../query');
const Conversation = require('../models/Conversation');

const type = 'conversation';

parser.setSingle(type, function(record){
    return parseOneRecord(record);
})

function parseOneRecord(record){

    let entity;
    let params = {
        partners    : [],
        members     : []
    };

    let node = record.get('c');

    let user = record.get('u');
    let partner = record.get('p');

    let memberU = record.get('ma');
    let memberP = record.get('mb');

    if (user && partner){
        params.partners.push(parseInt(user.properties.uid));
        params.partners.push(parseInt(partner.properties.uid));

        if (memberU && memberP){
            params.members[parseInt(user.properties.uid)] = memberU.properties.unread;
            params.members[parseInt(partner.properties.uid)] = memberP.properties.unread;
        }
    }

    entity = new Conversation(node, params);

    return entity;
}


let ConversationRepository = {

    createOne       : function(userAId, userBId){

        return new Promise((resolve, reject) => {

            let query = `
                MERGE (id:UniqueId {name:'${type}'})
                ON CREATE SET id.count = 1
                ON MATCH SET id.count = id.count + 1

                WITH id.count AS uid

                MATCH (u:User {uid:${userAId}}), (p:User {uid:${userBId}})
                CREATE (u)-[ma:MEMBERS]->(c:Conversation)<-[mb:MEMBERS]-(p)
                SET c.uid = uid
                RETURN c, p, u, ma, mb
            `;

            queryEx.exec(query)
            .then(results => {
                return resolve(parser.records(results, type, true));
            }).catch(err => {
                return reject(err);
            });

        });
    },

    findOneByUsers  : function(userAId, userBId){

        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u:User {uid:${userAId}})-[ma:MEMBERS]->(c:Conversation)<-[mb:MEMBERS]-(p:User {uid:${userBId}})
                RETURN c, p, u, ma, mb
            `;

            queryEx.exec(query)
            .then(results => {
                return resolve(parser.records(results, type, true));
            }).catch(err => {
                return reject(err);
            });

        });
    },

    findOrCreate    : function(usersId){

        let userAId = usersId[0];
        let userBId = usersId[1];

        return new Promise((resolve, reject) => {
            this.findOneByUsers(userAId, userBId)
            .then(conv => {
                if (!conv){
                    this.createOne(userAId, userBId)
                    .then(_conv => {
                        return resolve(_conv);
                    }, function(err){
                        return reject(err);
                    });
                } else {
                    return resolve(conv);
                }
            }, function(err){
                return reject(err);
            });
        });
    },

    findOneById     : function(convId, userId){

        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u:User {uid:${userId}})-[ma:MEMBERS]->(c:Conversation {uid:${convId}})<-[mb:MEMBERS]-(p:User)
                RETURN c, p, u, ma, mb
            `;

            queryEx.exec(query)
            .then(results => {
                return resolve(parser.records(results, type, true));
            }).catch(err => {
                return reject(err);
            });
        });
    },

    findAllByUser  : function(userId){

        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u:User {uid:${userId}})-[ma:MEMBERS]->(c:Conversation)<-[mb:MEMBERS]-(p:User), (u)-[ru:RELATION]->(r:Match)<-[rp:RELATION]-(p)
                WHERE ru.like = TRUE AND rp.like = TRUE AND r.blocked = FALSE

                RETURN c, p, u, ma, mb
            `;

            queryEx.exec(query)
            .then(results => {
                return resolve(parser.records(results, type));
            }).catch(err => {
                return reject(err);
            });
        });
    },

    setUnreadConv   : function(convId, userId){

        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u:User {uid:${userId}})-[ma:MEMBERS]->(c:Conversation {uid:${convId}})<-[mb:MEMBERS]-(p:User)
                SET mb.unread = TRUE
                RETURN c, p, u, ma, mb
            `;

            queryEx.exec(query)
            .then(results => {
                return resolve(parser.records(results, type, true));
            }).catch(err => {
                return reject(err);
            });

        });
    },

    setReadConv   : function(convId, userId){

        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u:User {uid:${userId}})-[ma:MEMBERS]->(c:Conversation {uid:${convId}})<-[mb:MEMBERS]-(p:User)
                SET ma.unread = NULL
                RETURN c, p, u, ma, mb
            `;

            queryEx.exec(query)
            .then(results => {
                return resolve(parser.records(results, type, true));
            }).catch(err => {
                return reject(err);
            });

        });
    },

    getUnreadConvs  : function(userId){
        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u:User {uid:${userId}})-[ma:MEMBERS]->(c:Conversation)<-[mb:MEMBERS]-(p:User)
                WHERE ma.unread = TRUE
                RETURN c, p, u, ma, mb
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

module.exports = ConversationRepository;