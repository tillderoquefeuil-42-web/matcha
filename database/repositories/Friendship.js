const queryEx = require('../query');
const parser = require('../parser');
const Friendship = require('../models/Friendship');

const type = 'friendship';

parser.setSingle(type, function(record){
    return parseOneRecord(record);
})

function parseOneRecord(record){

    let entity;
    let params = {
        partners    : [],
        links       : []
    };

    let node = record.get('f');

    let users = [
        record.get('u1'),
        record.get('u2')
    ];

    for (let i in users){
        if (users[i]){
            params.partners.push(users[i].identity.low);
        }
    }

    let links = [
        record.get('f1'),
        record.get('f2')
    ];

    for (let i in links){
        if (links[i]){
            params.links.push(links[i].properties);
        }
    }

    entity = new Friendship(node, params);

    return entity;
}


let FriendshipRepository = {

    createOne       : function(user1Id, user2Id){
        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u1:User), (u2:User)
                WHERE ID(u1)=${user1Id} AND ID(u2)=${user2Id}
                CREATE (u1)-[f1:FRIEND {accepted:TRUE, locked:FALSE}]->(f:Friendship)<-[f2:FRIEND {accepted:TRUE, locked:FALSE}]-(u2)
                RETURN f, u1, u2, f1, f2
            `;

            queryEx.exec(query)
            .then(results => {
                return resolve(parser.records(results, type, true));
            }).catch(err => {
                return reject(err);
            });
        });
    },

    findOneByUsers      : function(user1Id, user2Id){
        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u1:User)-[f1:FRIEND]->(f:Friendship)<-[f2:FRIEND]-(u2:User)
                WHERE ID(u1)=${user1Id} AND ID(u2)=${user2Id}
                RETURN f, u1, u2, f1, f2
            `;

            queryEx.exec(query)
            .then(results => {
                return resolve(parser.records(results, type, true));
            }).catch(err => {
                return reject(err);
            });
        });
    },

    findOneByConv       : function(convId){
        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u1:User)-->(c:Conversation)<--(u2:User),
                (u1)-[f1:FRIEND]->(f:Friendship)<-[f2:FRIEND]-(u2)
                WHERE ID(c)=${ convId }
                RETURN f, u1, u2, f1, f2
                LIMIT 1
            `;

            queryEx.exec(query)
            .then(results => {
                return resolve(parser.records(results, type, true));
            }).catch(err => {
                return reject(err);
            });
        });
    },

    findOrCreate    : function(user1Id, user2Id){
        return new Promise((resolve, reject) => {

            this.findOneByUsers(user1Id, user2Id)
            .then(friendship => {
                if (!friendship){
                    this.createOne(user1Id, user2Id)
                    .then(_friendship => {
                        return resolve(_friendship);
                    }, function(err){
                        return reject(err);
                    });
                } else {
                    return resolve(friendship);
                }
            }, function(err){
                return reject(err);
            });
        });
    },

    lockOne         : function(user1Id, user2Id){
        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u1:User)-[f1:FRIEND]->(f:Friendship)<-[f2:FRIEND]-(u2:User)
                WHERE ID(u1)=${user1Id} AND ID(u2)=${user2Id}
                SET f1.locked = TRUE
                RETURN f, u1, u2, f1, f2
            `;

            queryEx.exec(query)
            .then(results => {
                return resolve(parser.records(results, type, true));
            }).catch(err => {
                return reject(err);
            });
        });
    },

    unlockOne       : function(user1Id, user2Id){
        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u1:User)-[f1:FRIEND]->(f:Friendship)<-[f2:FRIEND]-(u2:User)
                WHERE ID(u1)=${user1Id} AND ID(u2)=${user2Id}
                SET f1.locked = FALSE
                RETURN f, u1, u2, f1, f2
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

module.exports = FriendshipRepository;