const queryEx = require('../query');
const Conversation = require('../models/Conversation');

function parseData(data){
    if (data.node !== false){
        let entity;
        if (data.node){
            entity = new Conversation(data.node.properties);
            entity._id = data.node.identity.low;
        }
        return Promise.resolve(entity);

    } else if (data.nodes !== false) {
        let entities = [];

        for (var i in data.nodes){
            let node = data.nodes[i];
            if (node){
                let entity;
                entity = new Conversation(node.properties);
                entity._id = node.identity.low;
                entities.push(entity);
            }
        }

        return Promise.resolve(entities);
    }

    return Promise.resolve(null);
}

function parseRecords(data){
    if (data.record){
        let entity;

        let node = data.record.get('c');
        let params = parseOneRecord(data.record);

        entity = new Conversation(node.properties, params);
        entity._id = data.node.identity.low;

        return Promise.resolve(entity);

    } else if (data.records) {
        let entities = [];

        for (var i in data.records){
            let record = data.records[i];

            let entity;

            let node = record.get('c');
            let params = parseOneRecord(record);

            entity = new Conversation(node.properties, params);
            entity._id = node.identity.low;

            entities.push(entity);
        }

        return Promise.resolve(entities);
    }

    return Promise.resolve(null);
}

function parseOneRecord(record){
    let user = record.get('u');
    let partner = record.get('p');
    let memberU = record.get('ma');
    let memberP = record.get('mb');

    let members = {};
    let partners = [];

    if (user && partner){
        partners.push(user.identity.low);
        partners.push(partner.identity.low);

        if (memberU && memberP){
            members[user.identity.low] = memberU.properties.unread;
            members[partner.identity.low] = memberP.properties.unread;
        }
    }

    return ({
        partners    : partners,
        members     : members
    });
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
            .then(parseRecords)
            .then(results => {
                return resolve(results);
            })
            .catch(err => {
                return reject(err);
            });

        });
    },

    deleteAll   : function(){

        return new Promise((resolve, reject) => {

            let query = `
                MATCH (c:Conversation)
                DETACH DELETE c
            `;

            let params = {};

            queryEx.exec(query, params)
            .then(parseData)
            .then(results => {
                return resolve(results);
            })
            .catch(err => {
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
            .then(parseRecords)
            .then(results => {
                return resolve(results);
            })
            .catch(err => {
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
                        resolve(_conv);
                    }, function(err){
                        reject(err);
                    });
                } else {
                    resolve(conv);
                }
            }, function(err){
                reject(err);
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
            .then(parseRecords)
            .then(results => {
                return resolve(results);
            })
            .catch(err => {
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

            let params = {
                object  :'c',
            };

            queryEx.exec(query, params, true)
            .then(parseRecords)
            .then(results => {
                return resolve(results);
            })
            .catch(err => {
                return reject(err);
            });

        });
    },

    setUnreadConv   : function(convId, userId){

        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u:User)-->(c:Conversation)<-[m:MEMBERS]-(p:User)
                WHERE ID(c)=${ convId } AND ID(u)=${ userId }
                SET m.unread = TRUE
                RETURN c
            `;

            queryEx.exec(query)
            .then(parseData)
            .then(results => {
                return resolve(results);
            })
            .catch(err => {
                return reject(err);
            });

        });
    },

    setReadConv   : function(convId, userId){

        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u:User)-[m:MEMBERS]->(c:Conversation)
                WHERE ID(c)=${ convId } AND ID(u)=${ userId }
                SET m.unread = NULL
                RETURN c
                `;
                
                queryEx.exec(query)
                .then(parseData)
                .then(results => {
                    return resolve(results);
                })
                .catch(err => {
                    return reject(err);
                });
                
            });
        },
        
        getUnreadConvs  : function(userId){
            return new Promise((resolve, reject) => {

                let query = `
                    MATCH (u:User)-[m:MEMBERS]->(c:Conversation)
                    WHERE ID(u)=${ userId } AND m.unread = TRUE
                    RETURN c
                `;

                let params = {object : 'c'};

                queryEx.exec(query, params, true)
                .then(parseData)
                .then(results => {
                    return resolve(results);
                })
                .catch(err => {
                    return reject(err);
                });
            });
        }

};

module.exports = ConversationRepository;