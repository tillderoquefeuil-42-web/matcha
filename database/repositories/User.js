const queryEx = require('../query');
const User = require('../models/user.js');

function parseData(data){
    if (data.node !== false){
        let entity;
        if (data.node){
            entity = new User(data.node.properties);
            entity._id = data.node.identity.low;
        }
        return Promise.resolve(entity);

    } else if (data.nodes !== false) {
        let entities = [];

        for (var i in data.nodes){
            let node = data.nodes[i];
            if (node){
                let entity;
                entity = new User(node.properties);
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
    let params = {
        profile_pic : null
    };


    let node = record.get('u');
    let profilePic = record.get('f');

    if (profilePic){
        params.profile_pic = profilePic;
    }

    entity = new User(node.properties, params);
    entity._id = node.identity.low;

    return entity;
}


let UserRepository = {

    createOne   : function(data){

        return new Promise((resolve, reject) => {

            let query = "CREATE (u:User $user) RETURN u";
            let params = {
                user    : data
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

    deleteAll   : function(){

        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u:User)
                DETACH DELETE u
            `;

            let params = {};

            queryEx.exec(query, params)
            .then(parseData)
            .then(results => {
                return resolve(results);
            }).catch(err => {
                return reject(err);
            });
        });
    },

    deleteOne   : function(user){
        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u:User)
                WHERE ID(u)=${user._id}
                OPTIONAL MATCH (u)-[me:MEMBERS]->(c:Conversation)-[o:OWN]->(m:Message)<-[b:BELONG_TO]-(_f:File)
                DETACH DELETE _f, m, c, u
            `;

            let params = {};

            queryEx.exec(query, params)
            .then(results => {
                return resolve(results);
            }).catch(err => {
                return reject(err);
            });
        });

    },

    updateOne   : function(data, _id){

        let id = _id || data._id;
        delete data._id;
        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u:User)
                WHERE ID(u) = ${id}
                SET u = $user
                WITH u
                OPTIONAL MATCH (u)-[pp:PROFILE_PIC {current:true}]->(f:File)
                RETURN u, f
            `;

            let params = {
                user    : data
            };

            queryEx.exec(query, params)
            .then(parseRecords)
            .then(results => {
                return resolve(results);
            })
            .catch(err => {
                return reject(err);
            });

        });
    },

    findOne     : function(params){
        return new Promise((resolve, reject) => {

            let request = `
                MATCH (u:User)
                WHERE $AND
                OPTIONAL MATCH (u)-[pp:PROFILE_PIC {current:true}]->(f:File)
                RETURN u, f
            `;

            let query = queryEx.buildRequest(request, {
                object:'u',
                $AND : params
            });

            queryEx.exec(query, params)
            .then(parseRecords)
            .then(results => {
                return resolve(results);
            })
            .catch(err => {
                return reject(err);
            });

        });
    },

    findAnd     : function(params){
        return new Promise((resolve, reject) => {

            let request = "MATCH (u:User) WHERE $AND RETURN u";
            let query = queryEx.buildRequest(request, {
                object:'u',
                $AND : params
            });

            params.object = 'u';

            queryEx.exec(query, params, true)
            .then(parseData)
            .then(results => {
                return resolve(results);
            })
            .catch(err => {
                console.log(err);
                return reject(err);
            });

        });
    },

    findOr      : function(params){

        return new Promise((resolve, reject) => {

            let request = "MATCH (u:User) WHERE $OR RETURN u";
            let query = queryEx.buildRequest(request, {
                object:'u',
                $OR : params
            });

            queryEx.exec(query, params, true)
            .then(parseData)
            .then(results => {
                return resolve(results);
            })
            .catch(err => {
                return reject(err);
            });

        });
    },

    updateProfilePicture            : function(file, user){
        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u:User), (f:File)
                WHERE ID(u) = ${user._id} AND ID(f) = ${file._id}
                OPTIONAL MATCH (u)-[oldpp:PROFILE_PIC {current:true}]->(oldf:File)
                SET oldpp.current = false
                CREATE (u)-[pp:PROFILE_PIC {current:true}]->(f)
                RETURN u, f
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

    findLocalByUsernameOrEmail      : function(username){
        return new Promise((resolve, reject) => {

            let params = {email:username, username:username};

            let request = "MATCH (u:User) WHERE 'local' IN u.providers AND ($OR) RETURN u";
            let query = queryEx.buildRequest(request, {
                object  :'u',
                $OR     : params
            });

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

    findAllFriends  : function(user){
        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u:User), (u2:User)
                WHERE ID(u) <> ${user._id} AND ID(u2) = ${user._id}

                OPTIONAL MATCH (u)-[f1:FRIEND]->(fs:Friendship)<-[f2:FRIEND]-(u2)
                WITH u, u2, fs
                WHERE (fs IS NULL) OR (f1.locked = FALSE AND f2.locked = FALSE)
                OPTIONAL MATCH (u)-[pp:PROFILE_PIC {current:true}]->(f:File)

                RETURN DISTINCT u, f
            `

            let params = {object : 'u'};

            queryEx.exec(query, params, true)
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

module.exports = UserRepository;