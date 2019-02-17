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
        params.partners.push(user.identity.low);
        params.partners.push(partner.identity.low);

        if (memberU && memberP){
            params.members[user.identity.low] = memberU.properties.unread;
            params.members[partner.identity.low] = memberP.properties.unread;
        }
    }

    entity = new Conversation(node, params);

    return entity;
}


let ConversationRepository = {

    createOne       : function(userAId, userBId){

        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u:User), (p:User)
                WHERE ID(u)=${userAId} AND ID(p)=${userBId}
                CREATE (u)-[ma:MEMBERS]->(c:Conversation)<-[mb:MEMBERS]-(p)
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
                MATCH (u:User)-[ma:MEMBERS]->(c:Conversation)<-[mb:MEMBERS]-(p:User)
                WHERE ID(u)=${userAId} AND ID(p)=${userBId}
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
                MATCH (u:User)-[ma:MEMBERS]->(c:Conversation)<-[mb:MEMBERS]-(p:User)
                WHERE ID(c)=${ convId } AND ID(u)=${ userId }
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
                MATCH (u:User)-[ma:MEMBERS]->(c:Conversation)<-[mb:MEMBERS]-(p:User)
                WHERE ID(u)=${userId}
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
                MATCH (u:User)-[ma:MEMBERS]->(c:Conversation)<-[mb:MEMBERS]-(p:User)
                WHERE ID(c)=${ convId } AND ID(u)=${ userId }
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
                MATCH (u:User)-[ma:MEMBERS]->(c:Conversation)<-[mb:MEMBERS]-(p:User)
                WHERE ID(c)=${ convId } AND ID(u)=${ userId }
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
                MATCH (u:User)-[ma:MEMBERS]->(c:Conversation)<-[mb:MEMBERS]-(p:User)
                WHERE ID(u)=${ userId } AND ma.unread = TRUE
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