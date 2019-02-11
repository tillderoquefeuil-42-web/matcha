const queryEx = require('../query');
const Message = require('../models/Message');

function parseData(data){

    if (data.node !== false){
        let entity;
        if (data.node){
            entity = new Message(data.node.properties);
            entity._id = data.node.identity.low;
        }
        return Promise.resolve(entity);
        
    } else if (data.nodes !== false) {
        let entities = [];
        
        for (var i in data.nodes){
            let node = data.nodes[i];
            if (node){
                let entity;
                entity = new Message(node.properties);
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

        let r = parseOneRecord(data.record);
        let node = r.node;

        entity = new Message(node.properties, r.params);
        entity._id = data.node.identity.low;

        return Promise.resolve(entity);

    } else if (data.records) {
        let entities = [];
        let nodes = {};

        for (let i in data.records){
            let record = data.records[i];
            
            
            let r = parseOneRecord(record);
            let _id = r.node.identity.low;
            
            if (nodes[_id]){
                nodes[_id] = mergeNodes(nodes[_id], r);
            } else {
                nodes[_id] = r;
            }
        }

        for (let i in nodes){
            let entity;
            let r = nodes[i];

            entity = new Message(r.node.properties, r.params);
            entity._id = i;

            entities.push(entity);
        }


        return Promise.resolve(entities);
    }

    return Promise.resolve(null);
}

function mergeNodes(old, node){

    if (!old.params.files){
        return node;
    } else if (!node.params.files){
        return old;
    } else {
        old.params.files = old.params.files.concat(node.params.files);
    }

    return old;
}

function parseOneRecord(record){
    let data = {};

    data.node = record.get('m');

    data.params = {
        conv    : record.get('c'),
        sender  : record.get('u'),
        own     : record.get('o'),
    };

    if (record.has('_f')){
        let files = record.get('_f');
        if (files){
            if (files.properties){
                files = [files];
            }
            
            data.params.files = files;
        }
    }

    return data;
}



let MessageRepository = {

    deleteAll   : function(){

        return new Promise((resolve, reject) => {

            let query = `
                MATCH (m:Message)
                DETACH DELETE m
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

    createOne   : function(message, senderId, convId, filesId){

        return new Promise((resolve, reject) => {

            this.resetLastProp(convId)
            .then(result => {

                let query = `
                    MATCH (u:User)-[ma:MEMBERS]->(c:Conversation)
                    WHERE ID(c)=${convId} AND ID(u)=${senderId}
                    CREATE (c)-[o:OWN $own]->(m:Message $message)-[f:FROM]->(u)
                    RETURN m, u, c, o
                `;
                
                let params = {
                    message : {
                        value       : message,
                        date        : (new Date()).getTime(),
                    },
                    own     : {last : true}
                };

                queryEx.exec(query, params)
                .then(parseRecords)
                .then(results => {

                    if (filesId && filesId.length > 0){
                        results.files = filesId;
                        
                        let filesQuery = `
                            MATCH (m:Message)
                            WHERE ID(m)=${results._id}
                            CREATE 
                        `;

                        for (let i in filesId){
                            if (i > 0){
                                filesQuery += ', '; 
                            }
                            filesQuery += `(m)-[tf${i}:TMP]->(_f${i}:TmpFile {id:${filesId[i]}})`
                        }

                        queryEx.exec(filesQuery)
                        .then(response => {
                            return resolve(results);
                        });

                    } else {
                        return resolve(results);
                    }

                })
                .catch(err => {
                    return reject(err);
                });

            }, function(err){
                return reject(err);
            });


        });
    },

    resetLastProp   : function(convId){

        return new Promise((resolve, reject) => {

            let query = `
                MATCH (c)-[o:OWN]->(om:Message)
                WHERE ID(c)=${convId}
                SET o.last = NULL AND o.readBy = NULL
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

    findByConversation : function(conv, limit, skip){

        let convId = (typeof conv === 'object')? conv._id : conv;

        return new Promise((resolve, reject) => {

            let query = `
                MATCH (c:Conversation)-[o:OWN]->(m:Message)-[f:FROM]->(u:User)
                WHERE ID(c)=${convId}
                OPTIONAL MATCH (_f:File)-[b:BELONG_TO]->(m)<-[o]-(c)
                RETURN c, m, o, u, _f
                ORDER BY m.date DESC
            `;

            if (limit){
                skip = skip || 0;
                query += `SKIP ${skip} LIMIT ${limit}`;
            }

            let params = {object : 'm'};

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

    findLastMessageByConversations : function(convs){

        let ids = [];
        for (var i in convs){
            ids.push(convs[i]._id);
        }

        return new Promise((resolve, reject) => {

            let query = `
                MATCH (c)-[o:OWN]->(m:Message)-[f:FROM]->(u:User)
                WHERE ID(c) IN [${ids.join(', ')}] AND o.last = TRUE
                OPTIONAL MATCH (_f:File)-[b:BELONG_TO]->(m)<-[o]-(c)
                RETURN m, c, o, u, _f
                `;
                
                let params = {object : 'm'};
                
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
        
        updateOneMessageFiles   : function(file, convId) {
            
            return new Promise((resolve, reject) => {
                
                let query = `
                MATCH (c)-[o:OWN]->(m:Message)-->(f:TmpFile), (m)-->(u:User), (_f:File)
                WHERE ID(_f)=${file._id} AND ID(c)=${convId} AND f.id=${file.id}
                CREATE (_f)-[b:BELONG_TO]->(m)
                DETACH DELETE f
                RETURN m, c, o, u, _f;
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

    }

};

module.exports = MessageRepository;