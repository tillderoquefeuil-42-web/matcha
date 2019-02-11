const queryEx = require('../query');
const File = require('../models/File');

function parseData(data){

    if (data.node !== false){
        let entity;
        if (data.node){
            entity = new File(data.node.properties);
            entity._id = data.node.identity.low;
        }
        return Promise.resolve(entity);
        
    } else if (data.nodes !== false) {
        let entities = [];
        
        for (var i in data.nodes){
            let node = data.nodes[i];
            if (node){
                let entity;
                entity = new File(node.properties);
                entity._id = node.identity.low;
                entities.push(entity);
            }
        }

        return Promise.resolve(entities);
    }

    return Promise.resolve(null);
}

let FileRepository = {

    deleteAll   : function(){

        return new Promise((resolve, reject) => {

            let query = `
                MATCH (f:File)
                DETACH DELETE f
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

    createOne   : function(file){

        return new Promise((resolve, reject) => {

            let query = `
                CREATE (f:File $file)
                RETURN f
            `;

            let params = {
                file : file
            };

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

    userLinks   : function(filename, userId){

        return new Promise((resolve, reject) => {

            let query = `
                MATCH (f:File), (u:User)
                WHERE f.filename='${filename}' AND ID(u)=${userId}

                OPTIONAL MATCH (f)<-[pp:PROFILE_PIC]-(au:User)
                OPTIONAL MATCH (f)-[b:BELONG_TO]->(m:Message)<-[o:OWN]-(c:Conversation)<-[me:MEMBERS]-(u)
                    
                WITH f, u
                WHERE (pp IS NOT NULL) OR (b IS NOT NULL)

                RETURN f
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

    }

};

module.exports = FileRepository;