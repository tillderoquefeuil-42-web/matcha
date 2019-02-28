const parser = require('../parser');
const queryEx = require('../query');
const User = require('../models/user.js');


const type = 'user';

parser.setSingle(type, function(record){
    return parseOneRecord(record);
})

parser.setMerges(type, ['tags', 'pictures']);

function parseOneRecord(record){

    let params = {
        profile_pic : null,
        others      : [],
        tags        : []
    };

    let node = record.get('u');

    if (record.has('f')){
        params.profile_pic = record.get('f');
    }

    if (record.has('of')){
        let others = record.get('of');
        others = others || [];

        if (others && others.properties){
            others = [others];
        }

        for (let i in others){
            params.others.push(others[i]);
        }
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
                OPTIONAL MATCH (u)-[op:OTHER_PIC {current:true}]->(of:File)
                OPTIONAL MATCH (u)-[li:LIVES {current:true}]->(l:Location)
                OPTIONAL MATCH (u)-[i:INTEREST_IN]->(t:Tag)
                RETURN u, f, t, l, of
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
                OPTIONAL MATCH (u)-[op:OTHER_PIC {current:true}]->(of:File)
                OPTIONAL MATCH (u)-[li:LIVES {current:true}]->(l:Location)
                OPTIONAL MATCH (u)-[i:INTEREST_IN]->(t:Tag)
                RETURN u, f, t, l, of
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

    updateOtherPictures             : function(filesId, user){
        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u:User), (f:File)
                WHERE ID(u) = ${user._id} AND f.id IN [${filesId.join(', ')}]
                OPTIONAL MATCH (u)-[oldop:OTHER_PIC {current:true}]->(oldf:File)
                SET oldop.current = false
                MERGE (u)-[op:OTHER_PIC {current:true}]->(f)
                RETURN u
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
    },

    matching        : function(user, distance){
        
        distance = distance || 50000;

        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u:User)-[ulr:LIVES {current:true}]->(ul:Location), (m:User)-[mlr:LIVES {current:true}]->(ml:Location)
                WHERE ID(u)=${user._id} AND ID(m)<>${user._id}

                SET m.g_matched = CASE
                    WHEN u.see_m=TRUE AND m.gender='male' THEN TRUE
                    WHEN u.see_f=TRUE AND m.gender='female' THEN TRUE
                    WHEN u.see_nb=TRUE AND m.gender='nb' THEN TRUE
                    ELSE NULL
                END

                SET m.o_matched = CASE
                    WHEN m.see_m=TRUE AND u.gender='male' THEN TRUE
                    WHEN m.see_f=TRUE AND u.gender='female' THEN TRUE
                    WHEN m.see_nb=TRUE AND u.gender='nb' THEN TRUE
                    ELSE NULL
                END

                SET ul.point = point({ longitude: ul.lng, latitude: ul.lat })
                SET ml.point = point({ longitude: ml.lng, latitude: ml.lat })
                SET m.distance = round(distance(ul.point, ml.point))

                WITH m
                WHERE m.g_matched IS NOT NULL AND m.o_matched IS NOT NULL AND m.distance < ${distance}

                RETURN m
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

module.exports = UserRepository;