const queryEx = require('../query');
const Tag = require('../models/Tag');

function parseRecords(data){
    if (data.record){
        let entity = parseOneRecord(data.record);
        return Promise.resolve(entity);

    } else if (data.records) {
        let entities = [];

        for (var i in data.records){
            let entity = parseOneRecord(data.records[i]);
            entities.push(entity);
        }

        return Promise.resolve(entities);
    }

    return Promise.resolve(null);
}

function parseOneRecord(record){

    let entity;

    let node = record.get('t');

    entity = new Tag(node.properties);
    entity._id = node.identity.low;

    return entity;
}


let TagRepository = {

    deleteAll   : function(){

        return new Promise((resolve, reject) => {

            let query = `
                MATCH (t:Tag)
                DETACH DELETE t
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

    checkTags       : function(tags){

        return new Promise((resolve, reject) => {

            let query = '';
            
            for (let i in tags){
                query += `
                    MERGE (t${i}:Tag { label:'${tags[i]}' })
                `;
            }

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

    resetLinks      : function(user){
        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u:User)-[i:INTEREST_IN]->(t:Tag)
                WHERE ID(u) = ${user._id}
                DETACH DELETE i
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

    linkToUser      : function(user, tags){
        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u:User), (t:Tag)
                WHERE ID(u) = ${user._id} AND t.label IN ['${tags.join("', '")}']
                CREATE (u)-[i:INTEREST_IN]->(t)

                RETURN t
            `;

            queryEx.exec(query, {object:'t'}, true)
            .then(parseRecords)
            .then(results => {
                return resolve(results);
            })
            .catch(err => {
                return reject(err);
            });

        });

    },

    updateUserTags      : function(user, tags) {
        let _this = this;

        return new Promise((resolve, reject) => {
            _this.checkTags(tags)
            .then(r => {
                _this.resetLinks(user)
                .then(r => {
                    _this.linkToUser(user, tags)
                    .then(r => {
                        return resolve(r);
                    });
                });
            }).catch(err => {
                return reject(err);
            });
        });
    }

};

module.exports = TagRepository;