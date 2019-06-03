const database = require('./db.js');

let query = {};

query.exec = function(query, params){
    return new Promise((resolve, reject) => {
        let session = database.session();
        session.run(query, params)
        .then(result => {
            session.close();

            let data = {
                length  : result.records.length,
                records : result.records
            };

            return resolve(data);
        }, function (err) {
            return reject(err);
        });
    });
};

query.buildRequest = function(request, params){

    let query = request;

    if (params.$AND){
        let $AND = this.buildAndCondition(params.$AND, params.object);
        query = query.replace('$AND', $AND)
    }

    if (params.$OR){
        let $OR = this.buildOrCondition(params.$OR, params.object);
        query = query.replace('$OR', $OR)
    }

    return query;
};

query.buildOrCondition = function($OR, object){
    return this.buildCondition($OR, 'OR', object);
};

query.buildAndCondition = function($AND, object){
    return this.buildCondition($AND, 'AND', object);
};

query.buildCondition = function(params, keyword, object){

    let condition = "";

    let j = 0;
    for (var i in params){
        condition += (j > 0? `${keyword} ` : "");

        let equality = (typeof params[i] === 'object'? 'IN' : '=');

        if (i === '_id' || i === 'id'){
            i = 'uid';
        }
        
        condition += `${object}.${i} ${equality} {${i}} `;
        j++;
    }

    return condition;
};

module.exports = query