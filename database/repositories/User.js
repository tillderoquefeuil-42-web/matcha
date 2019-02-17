const parser = require('../parser');
const queryEx = require('../query');
const User = require('../models/user.js');

const type = 'user';

parser.setSingle(type, function(record){
    return parseOneRecord(record);
})

parser.setMerges(type, ['tags']);

function parseOneRecord(record){

    let params = {
        profile_pic : null,
        tags        : []
    };

    let node = record.get('u');

    if (record.has('f')){
        params.profile_pic = record.get('f');
    }

    if (record.has('t')){
        let tags = record.get('t');
        tags = tags || [];

        if (tags && tags.properties){
            tags = [tags];
        }

        for (let i in tags){
            params.tags.push(tags[i].properties.label);
        }
    }

    if (record.has('l')){
        params.location = record.get('l');
    }


    let entity = new User(node, params);

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
            .then(results => {
                return resolve(parser.records(results, type, true));
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

            queryEx.exec(query)
            .then(results => {
                return resolve(parser.records(results, type));
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
                OPTIONAL MATCH (u)-[li:LIVES {current:true}]->(l:Location)
                OPTIONAL MATCH (u)-[i:INTEREST_IN]->(t:Tag)
                RETURN u, f, t, l
            `;

            let params = {
                user    : data
            };

            queryEx.exec(query, params)
            .then(results => {
                return resolve(parser.records(results, type, true));
            }).catch(err => {
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
                OPTIONAL MATCH (u)-[li:LIVES {current:true}]->(l:Location)
                OPTIONAL MATCH (u)-[i:INTEREST_IN]->(t:Tag)
                RETURN u, f, t, l
            `;

            let query = queryEx.buildRequest(request, {
                object:'u',
                $AND : params
            });

            queryEx.exec(query, params)
            .then(results => {
                return resolve(parser.records(results, type, true));
            }).catch(err => {
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

            queryEx.exec(query, params)
            .then(results => {
                return resolve(parser.records(results, type));
            }).catch(err => {
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
            .then(results => {
                return resolve(parser.records(results, type));
            }).catch(err => {
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
            .then(results => {
                return resolve(parser.records(results, type, true));
            }).catch(err => {
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
            .then(results => {
                return resolve(parser.records(results, type, true));
            }).catch(err => {
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

            queryEx.exec(query)
            .then(results => {
                return resolve(parser.records(results, type));
            }).catch(err => {
                return reject(err);
            });

        });
    }

};

module.exports = UserRepository;