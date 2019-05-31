const parser = require('../parser');
const queryEx = require('../query');
const User = require('../models/User');

const defaultParams = require('../../config/config').MATCHING;
const time = require('../../controllers/utils/time');

const type = 'user';

const userFields = [
    '_id', 'password',
    'email', 'username', 'firstname', 'lastname',
    'valid', 'locked', 'connection_try',
    'providers', 'googleId', 'birthday',
    'gender', 'see_m', 'see_f', 'see_nb',
    'bio', 'profile_picture', 'language', 'online'
];


defaultParams.AGE._min = function(){
    let n = new Date()
    n.setFullYear(n.getUTCFullYear() - defaultParams.AGE.MIN);
    return time.toDatetime(n);
};

defaultParams.AGE._max = function(){
    var n = new Date()
    n.setFullYear(n.getUTCFullYear() - defaultParams.AGE.MAX);
    n.setDate(1);
    n.setMonth(0);

    return time.toDatetime(n);
};

parser.setSingle(type, function(record){
    return parseOneRecord(record);
})

parser.setMerges(type, ['tags', 'pictures', {label:'match_relation', single:true}]);

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

    if (record.has('r') && record.has('ru') && record.has('rp')){
        params.match_relation = {
            match       : record.get('r'),
            params      : {
                rel_user    : record.get('ru'),
                rel_partner : record.get('rp')
            }
        }
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

function filterByTags(results, tags){
    let data = [];

    for (let i in results){
        let user = results[i];

        let toAdd = true;
        for (let j in tags){
            if (user.tags.indexOf(tags[j]) === -1){
                toAdd = false;
                break;
            }
        }

        if (toAdd){
            data.push(user);
        }
    }

    return data;
}

function parseUserFields(user) {
    let data = {};

    for (let i in user){
        if (userFields.indexOf(i) !== -1){
            data[i] = user[i];
        }
    }

    return data;
}

let UserRepository = {

    createOne                   : function(data){

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

    deleteOne                   : function(user){
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

    updateOne                   : function(data, _id){

        let id = _id || data._id;
        data = parseUserFields(data);
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

    findOne                     : function(params){

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

    findAnd                     : function(params){

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

    findOr                      : function(params){

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

    updateProfilePicture        : function(file, user){

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

    updateOtherPictures         : function(filesId, user){

        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u:User), (f:File)
                WHERE ID(u) = ${user._id} AND f.id IN ["${filesId.join('", "')}"]
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

    findLocalByUsernameOrEmail  : function(username){

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

    online                      : function(user){

        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u:User)
                WHERE ID(u) = ${user._id}
                SET u.online = TRUE
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

    offline                     : function(user, datetime){

        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u:User)
                WHERE ID(u) = ${user._id}
                SET u.online = '${datetime}'
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

    findAllFriends              : function(user){

        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u:User)-[ru:RELATION {like:TRUE}]->(r:Match {blocked:FALSE})<-[rp:RELATION {like:TRUE}]-(m:User)
                WHERE ID(u)<>$userId AND ID(m)=$userId

                OPTIONAL MATCH (u)-[pp:PROFILE_PIC {current:true}]->(f:File)

                RETURN DISTINCT u, f
            `;

            let parameters = {
                userId  : user._id
            };

            queryEx.exec(query, parameters)
            .then(results => {
                return resolve(parser.records(results, type));
            }).catch(err => {
                return reject(err);
            });
        });
    },

    matching                    : function(user, options){

        options = options || {};

        options.limit = options.limit || 250;
        options.distance = options.distance || 0;
        options.age_min = options.age_min || 0;
        options.age_max = options.age_max || 0;
        options.rate_min = options.rate_min || 0;
        options.rate_max = options.rate_max || 0;
        options.tags = (options.tags && options.tags.length > 0)? options.tags : null;

        return new Promise((resolve, reject) => {

            let query = `
                MATCH (m:User)-[mlr:LIVES {current:true}]->(ml:Location), (u:User)-[ulr:LIVES {current:true}]->(ul:Location)
                WHERE ID(m)=$userId AND ID(u)<>$userId

                OPTIONAL MATCH (m)-[c:CRITERIA]->(sp:SearchParams)
                OPTIONAL MATCH (u)-[ci:INTEREST_IN]->(ct:Tag)<-[ci2:INTEREST_IN]-(m)
                OPTIONAL MATCH (m)-[mi:INTEREST_IN]->(mt:Tag)
                OPTIONAL MATCH (u)-[ru:RELATION]->(r:Match)<-[rp:RELATION]-(m)
                OPTIONAL MATCH (u)-[u_ru:RELATION]->(u_r:Match)

                WITH u, m, sp, r, ru, rp,
                count(DISTINCT mt) AS user_tags,
                count(DISTINCT ct) AS common_tags,
                size([x IN collect(u_ru.see) WHERE x = TRUE]) AS user_see_nbr,
                size([x IN collect(u_ru.like) WHERE x = TRUE]) AS user_like_nbr,
                round(distance(point({ longitude: ml.lng, latitude: ml.lat }), point({ longitude: ul.lng, latitude: ul.lat }))) AS distance

                WITH u, m, sp, r, ru, rp, distance, common_tags, user_tags,
                CASE
                    WHEN ${options.distance} > 0 THEN ${options.distance}
                    WHEN sp.distance > 0 THEN sp.distance
                    ELSE ${defaultParams.DISTANCE}
                END AS c_distance,

                CASE
                    WHEN ${options.age_min} > 0 THEN ${options.age_min}
                    WHEN exists(sp.age_min) THEN sp.age_min
                    ELSE ${defaultParams.AGE._min()}
                END AS c_age_min,

                CASE
                    WHEN ${options.age_max} > 0 THEN ${options.age_max}
                    WHEN exists(sp.age_max) THEN sp.age_max
                    ELSE ${defaultParams.AGE._max()}
                END AS c_age_max,

                CASE
                    WHEN ${options.rate_min} > 0 THEN ${options.rate_min}
                    WHEN exists(sp.rate_min) THEN sp.rate_min
                    ELSE ${defaultParams.RATE.MIN}
                END AS c_rate_min,

                CASE
                    WHEN ${options.rate_max} > 0 THEN ${options.rate_max}
                    WHEN exists(sp.rate_max) THEN sp.rate_max
                    ELSE ${defaultParams.RATE.MAX}
                END AS c_rate_max,

                CASE
                    WHEN m.see_m=TRUE AND u.gender='male' THEN TRUE
                    WHEN m.see_f=TRUE AND u.gender='female' THEN TRUE
                    WHEN m.see_nb=TRUE AND u.gender='nb' THEN TRUE
                    ELSE NULL
                END AS g_matched,

                CASE
                    WHEN u.see_m=TRUE AND m.gender='male' THEN TRUE
                    WHEN u.see_f=TRUE AND m.gender='female' THEN TRUE
                    WHEN u.see_nb=TRUE AND m.gender='nb' THEN TRUE
                    ELSE NULL
                END AS o_matched,

                CASE
                    WHEN user_tags > 0 THEN (toFloat(common_tags) / user_tags)
                    ELSE 1
                END AS p_tags,

                CASE
                    WHEN sp.distance > 0 THEN (1 - (toFloat(distance) / (sp.distance*1000)))
                    ELSE 0
                END AS p_location,

                CASE
                    WHEN 0 < user_see_nbr <= 5 THEN 1
                    WHEN 5 < user_see_nbr <= 10 THEN 2
                    WHEN 10 < user_see_nbr <= 50 THEN 3
                    WHEN 50 < user_see_nbr <= 100 THEN 4
                    WHEN 100 < user_see_nbr THEN 5
                    ELSE 0
                END AS p_see_rate,

                CASE
                    WHEN 0 < user_like_nbr <= 5 THEN 1
                    WHEN 5 < user_like_nbr <= 10 THEN 2
                    WHEN 10 < user_like_nbr <= 50 THEN 3
                    WHEN 50 < user_like_nbr <= 100 THEN 4
                    WHEN 100 < user_like_nbr THEN 5
                    ELSE 0
                END AS p_like_rate,

                CASE
                    WHEN user_see_nbr > 0 THEN (toFloat(user_like_nbr) / toFloat(user_see_nbr))
                    ELSE 0
                END AS p_per_rate,

                CASE
                    WHEN exists(r.blocked) AND r.blocked=TRUE THEN TRUE
                    WHEN exists(ru.like) AND ru.like=TRUE AND rp.like=TRUE THEN TRUE
                    ELSE FALSE
                END AS r_blocked


                WITH u, m, sp, r, ru, rp, distance, common_tags, user_tags, c_distance,
                c_age_min, c_age_max, c_rate_min, c_rate_max, g_matched, o_matched, p_tags,
                p_location, p_see_rate, p_like_rate, p_per_rate, r_blocked,
                (p_like_rate * 3 + p_see_rate * 2 + p_per_rate * 75) AS p_rate


                WHERE g_matched IS NOT NULL
                AND o_matched IS NOT NULL
                AND distance <= (c_distance*1000)
                AND toInteger(c_age_min) >= toInteger(u.birthday) >= toInteger(c_age_max)
                AND toInteger(c_rate_min) <= toInteger(p_rate) <= toInteger(c_rate_max)
                AND r_blocked = FALSE

                OPTIONAL MATCH (u)-[pp:PROFILE_PIC {current:true}]->(f:File)
                OPTIONAL MATCH (u)-[op:OTHER_PIC {current:true}]->(of:File)
                OPTIONAL MATCH (u)-[li:LIVES {current:true}]->(l:Location)
                OPTIONAL MATCH (u)-[i:INTEREST_IN]->(t:Tag)

                RETURN DISTINCT u{.*, _id:ID(u), common_tags:common_tags, distance:distance, 
                    p_tags:p_tags, p_location:p_location, p_rate:p_rate
                },
                f, t, l, of, r, ru, rp
                LIMIT ${options.limit}
            `;

            let parameters = {
                userId  : user._id
            };

            // console.log(query);

            queryEx.exec(query, parameters)
            .then(results => {
                let data = parser.records(results, type);
                
                if (options.tags){
                    data = filterByTags(data, options.tags);
                }

                return resolve(data);
            }).catch(err => {
                return reject(err);
            });

        });
    },

    matchedProfiles             : function(user){

        return new Promise((resolve, reject) => {

            let query = `
                MATCH (m:User)-[mlr:LIVES {current:true}]->(ml:Location), (u:User)-[ulr:LIVES {current:true}]->(ul:Location)
                WHERE ID(m)=$userId AND ID(u)<>$userId


                OPTIONAL MATCH (m)-[c:CRITERIA]->(sp:SearchParams)
                OPTIONAL MATCH (u)-[ci:INTEREST_IN]->(ct:Tag)<-[ci2:INTEREST_IN]-(m)
                OPTIONAL MATCH (m)-[mi:INTEREST_IN]->(mt:Tag)
                OPTIONAL MATCH (u)-[ru:RELATION]->(r:Match)<-[rp:RELATION]-(m)
                OPTIONAL MATCH (u)-[u_ru:RELATION]->(u_r:Match)

                WITH u, m, sp, r, ru, rp,
                count(DISTINCT mt) AS user_tags,
                count(DISTINCT ct) AS common_tags,
                size([x IN collect(u_ru.see) WHERE x = TRUE]) AS user_see_nbr,
                size([x IN collect(u_ru.like) WHERE x = TRUE]) AS user_like_nbr,
                round(distance(point({ longitude: ml.lng, latitude: ml.lat }), point({ longitude: ul.lng, latitude: ul.lat }))) AS distance

                WITH u, m, sp, r, ru, rp, distance, common_tags, user_tags,
                CASE
                    WHEN user_tags > 0 THEN (toFloat(common_tags) / user_tags)
                    ELSE 1
                END AS p_tags,

                CASE
                    WHEN sp.distance > 0 THEN (1 - (toFloat(distance) / (sp.distance*1000)))
                    ELSE 0
                END AS p_location,

                CASE
                    WHEN 0 < user_see_nbr <= 5 THEN 1
                    WHEN 5 < user_see_nbr <= 10 THEN 2
                    WHEN 10 < user_see_nbr <= 50 THEN 3
                    WHEN 50 < user_see_nbr <= 100 THEN 4
                    WHEN 100 < user_see_nbr THEN 5
                    ELSE 0
                END AS p_see_rate,

                CASE
                    WHEN 0 < user_like_nbr <= 5 THEN 1
                    WHEN 5 < user_like_nbr <= 10 THEN 2
                    WHEN 10 < user_like_nbr <= 50 THEN 3
                    WHEN 50 < user_like_nbr <= 100 THEN 4
                    WHEN 100 < user_like_nbr THEN 5
                    ELSE 0
                END AS p_like_rate,

                CASE
                    WHEN user_see_nbr > 0 THEN (toFloat(user_like_nbr) / toFloat(user_see_nbr))
                    ELSE 0
                END AS p_per_rate

                WHERE r.blocked = FALSE
                AND ru.like = TRUE
                AND rp.like = TRUE

                OPTIONAL MATCH (u)-[pp:PROFILE_PIC {current:true}]->(f:File)
                OPTIONAL MATCH (u)-[op:OTHER_PIC {current:true}]->(of:File)
                OPTIONAL MATCH (u)-[li:LIVES {current:true}]->(l:Location)
                OPTIONAL MATCH (u)-[i:INTEREST_IN]->(t:Tag)

                RETURN DISTINCT u{.*, _id:ID(u), common_tags:common_tags, distance:distance, 
                    p_tags:p_tags, p_location:p_location, p_rate:(p_like_rate * 3 + p_see_rate * 2 + p_per_rate * 75)
                },
                f, t, l, of, r, ru, rp
            `;

            let parameters = {
                userId  : user._id
            };

            queryEx.exec(query, parameters)
            .then(results => {
                let data = parser.records(results, type);
                return resolve(data);
            }).catch(err => {
                return reject(err);
            });

        });
    },

    getUsersById                : function(ids){

        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u:User)
                WHERE ID(u) IN [${ids.join(', ')}]
                OPTIONAL MATCH (u)-[pp:PROFILE_PIC {current:true}]->(f:File)

                RETURN DISTINCT u, f
            `;

            queryEx.exec(query)
            .then(results => {
                let data = parser.records(results, type);
                return resolve(data);
            }).catch(err => {
                return reject(err);
            });

        });
    },

    getUpdatedPartner           : function(user, partner_id){

        if (user._id === partner_id){
            return this.getOwnProfile(user);
        }

        return new Promise((resolve, reject) => {

            let query = `
                MATCH (m:User)-[mlr:LIVES {current:true}]->(ml:Location), (u:User)-[ulr:LIVES {current:true}]->(ul:Location)
                WHERE ID(m)=$userId AND ID(u)=$partnerId

                OPTIONAL MATCH (m)-[c:CRITERIA]->(sp:SearchParams)
                OPTIONAL MATCH (u)-[ci:INTEREST_IN]->(ct:Tag)<-[ci2:INTEREST_IN]-(m)
                OPTIONAL MATCH (m)-[mi:INTEREST_IN]->(mt:Tag)
                OPTIONAL MATCH (u)-[ru:RELATION]->(r:Match)<-[rp:RELATION]-(m)
                OPTIONAL MATCH (u)-[u_ru:RELATION]->(u_r:Match)

                WITH u, m, sp, r, ru, rp,
                count(DISTINCT mt) AS user_tags,
                count(DISTINCT ct) AS common_tags,
                size([x IN collect(u_ru.see) WHERE x = TRUE]) AS user_see_nbr,
                size([x IN collect(u_ru.like) WHERE x = TRUE]) AS user_like_nbr,
                round(distance(point({ longitude: ml.lng, latitude: ml.lat }), point({ longitude: ul.lng, latitude: ul.lat }))) AS distance

                WITH u, m, sp, r, ru, rp, distance, common_tags, user_tags,
                CASE
                    WHEN user_tags > 0 THEN (toFloat(common_tags) / user_tags)
                    ELSE 1
                END AS p_tags,

                CASE
                    WHEN sp.distance > 0 THEN (1 - (toFloat(distance) / (sp.distance*1000)))
                    ELSE 0
                END AS p_location,

                CASE
                    WHEN 0 < user_see_nbr <= 5 THEN 1
                    WHEN 5 < user_see_nbr <= 10 THEN 2
                    WHEN 10 < user_see_nbr <= 50 THEN 3
                    WHEN 50 < user_see_nbr <= 100 THEN 4
                    WHEN 100 < user_see_nbr THEN 5
                    ELSE 0
                END AS p_see_rate,

                CASE
                    WHEN 0 < user_like_nbr <= 5 THEN 1
                    WHEN 5 < user_like_nbr <= 10 THEN 2
                    WHEN 10 < user_like_nbr <= 50 THEN 3
                    WHEN 50 < user_like_nbr <= 100 THEN 4
                    WHEN 100 < user_like_nbr THEN 5
                    ELSE 0
                END AS p_like_rate,

                CASE
                    WHEN user_see_nbr > 0 THEN (toFloat(user_like_nbr) / toFloat(user_see_nbr))
                    ELSE 0
                END AS p_per_rate,

                CASE
                    WHEN exists(r.blocked) AND r.blocked=TRUE THEN TRUE
                    ELSE FALSE
                END AS r_blocked

                WHERE r_blocked = FALSE

                OPTIONAL MATCH (u)-[pp:PROFILE_PIC {current:true}]->(f:File)
                OPTIONAL MATCH (u)-[op:OTHER_PIC {current:true}]->(of:File)
                OPTIONAL MATCH (u)-[li:LIVES {current:true}]->(l:Location)
                OPTIONAL MATCH (u)-[i:INTEREST_IN]->(t:Tag)

                RETURN DISTINCT u{.*, _id:ID(u), common_tags:common_tags, distance:distance, 
                    p_tags:p_tags, p_location:p_location, p_rate:(p_like_rate * 3 + p_see_rate * 2 + p_per_rate * 75)
                },
                f, t, l, of, r, ru, rp
            `;

            let parameters = {
                userId      : user._id,
                partnerId   : partner_id
            }

            queryEx.exec(query, parameters)
            .then(results => {
                let data = parser.records(results, type, true);
                return resolve(data);
            }).catch(err => {
                return reject(err);
            });

        });
    },

    getOwnProfile               : function(user){

        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u:User)
                WHERE ID(u)=${user._id}

                OPTIONAL MATCH (u)-[pp:PROFILE_PIC {current:true}]->(f:File)
                OPTIONAL MATCH (u)-[op:OTHER_PIC {current:true}]->(of:File)
                OPTIONAL MATCH (u)-[li:LIVES {current:true}]->(l:Location)
                OPTIONAL MATCH (u)-[i:INTEREST_IN]->(t:Tag)

                RETURN DISTINCT u{.*, _id:ID(u), distance:0, rate:75},
                f, of, l, t
            `;

            queryEx.exec(query)
            .then(results => {
                let data = parser.records(results, type, true);
                return resolve(data);
            }).catch(err => {
                return reject(err);
            });

        });
    },

    getFakesProfiles            : function(){

        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u:User)
                WHERE single(x IN u.providers WHERE x = "test")
                RETURN u
            `;

            queryEx.exec(query)
            .then(results => {
                let data = parser.records(results, type);
                return resolve(data);
            }).catch(err => {
                return reject(err);
            });
        });
    }

};

module.exports = UserRepository;