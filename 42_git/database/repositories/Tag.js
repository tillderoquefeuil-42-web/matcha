const queryEx = require('../query');
const parser = require('../parser');
const Tag = require('../models/Tag');

const type = 'tag';

parser.setSingle(type, function(record){
    return parseOneRecord(record);
});

function parseOneRecord(record){

    let entity;
    let node = record.get('t');

    entity = new Tag(node);

    return entity;
}


let TagRepository = {

    getAll          : function(){
        return new Promise((resolve, reject) => {

            let query = `
                MATCH (t:Tag) RETURN t
            `;

            queryEx.exec(query)
            .then(results => {
                return resolve(parser.records(results, type));
            }).catch(err => {
                return reject(err);
            });
        });
    },

    checkTags       : function(tags){
        return new Promise((resolve, reject) => {
            if (!tags.length){
                return resolve();
            }

            let query = `
                MERGE (id:UniqueId {name:'${type}'})
                ON CREATE SET id.count = 1
            `;

            for (let i in tags){
                query += `
                    WITH id
                    MERGE (t${i}:Tag { label:'${tags[i]}' })
                    ON CREATE SET id.count = id.count + 1, t${i}.uid = id.count
                `;
            }

            queryEx.exec(query)
            .then(results => {
                return resolve(parser.records(results, type));
            }).catch(err => {
                return reject(err);
            });
        });
    },

    resetLinks      : function(user){
        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u:User {uid:${user._id}})-[i:INTEREST_IN]->(t:Tag)
                DETACH DELETE i
            `;

            queryEx.exec(query)
            .then(results => {
                return resolve(parser.records(results, type));
            }).catch(err => {
                return reject(err);
            });
        });
    },

    linkToUser      : function(user, tags){
        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u:User {uid:${user._id}}), (t:Tag)
                WHERE t.label IN ['${tags.join("', '")}']
                CREATE (u)-[i:INTEREST_IN]->(t)

                RETURN t
            `;

            queryEx.exec(query)
            .then(results => {
                return resolve(parser.records(results, type));
            }).catch(err => {
                return reject(err);
            });
        });
    },

    updateUserTags  : function(user, tags) {
        let _this = this;

        return new Promise((resolve, reject) => {
            _this.checkTags(tags)
            .then(r => {
                _this.resetLinks(user)
                .then(r => {
                    if (tags.length > 0){
                        _this.linkToUser(user, tags)
                        .then(r => {
                            return resolve(r);
                        });
                    } else {
                        return resolve(r);
                    }
                });
            }).catch(err => {
                return reject(err);
            });
        });
    }

};

module.exports = TagRepository;