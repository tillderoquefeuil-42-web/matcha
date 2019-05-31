const parser = require('../parser');
const queryEx = require('../query');
const File = require('../models/File');

const type = 'file';

parser.setSingle(type, function(record){
    return parseOneRecord(record);
})

function parseOneRecord(record){

    let entity;

    let node = record.get('f');
    entity = new File(node);

    return entity;
}

let FileRepository = {

    createOne   : function(file){

        return new Promise((resolve, reject) => {

            let query = `
                MERGE (id:UniqueId {name:'${type}'})
                ON CREATE SET id.count = 1
                ON MATCH SET id.count = id.count + 1

                WITH id.count AS uid
                CREATE (f:File $file)
                SET f.uid = uid
                RETURN f
            `;

            let params = {
                file : file
            };

            queryEx.exec(query, params)
            .then(results => {
                return resolve(parser.records(results, type, true));
            }).catch(err => {
                return reject(err);
            });
        });
    },

    userLinks   : function(filename, userId){

        return new Promise((resolve, reject) => {

            let query = `
                MATCH (f:File {filename='${filename}'}), (u:User {uid:${userId}}), (au:User)

                OPTIONAL MATCH (f)<-[pp:PROFILE_PIC]-(au)
                OPTIONAL MATCH (f)<-[op:OTHER_PIC]-(au)
                OPTIONAL MATCH (f)-[b:BELONG_TO]->(m:Message)<-[o:OWN]-(c:Conversation)<-[me:MEMBERS]-(u)

                WITH f, u
                WHERE (pp IS NOT NULL) OR (b IS NOT NULL) OR (op IS NOT NULL)

                RETURN f
            `;

            queryEx.exec(query)
            .then(results => {
                return resolve(parser.records(results, type, true));
            }).catch(err => {
                return reject(err);
            });
        });
    },

    removeFiles     : function(filesId, user){
        return new Promise((resolve, reject) => {

            let query = `
                MATCH (f:File)<--(u:User {uid:${userId}})
                WHERE f.uid IN [${filesId.join(', ')}]

                DETACH DELETE f
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

module.exports = FileRepository;