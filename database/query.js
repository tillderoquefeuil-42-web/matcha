var database = require('./db.js');

var query = {};

query.exec = function(query, params, multi){
    return new Promise((resolve, reject) => {
        database.session.run(query, params)
        .then(result => {
            database.session.close();

            let data = {
                length  : result.records.length,
                node    : false,
                nodes   : false
            };

            if (!multi){
                data.node = null;
                if (data.length === 1){
                    let singleRecord = result.records[0];
                    data.record = result.records[0];
                    data.node = singleRecord.get(0);
                }
            } else if (data.length > 1 || multi){
                data.nodes = [];
                data.records = result.records;
                for (var i in result.records){
                    let record = result.records[i];
                    data.nodes.push(record.get(params.object));
                }
            }

            resolve(data);
        }, function (err) {
            console.log(err);
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
            condition += `ID(${object}) > 0 `;

            //  DON'T KNOW WHAT TO DO FOR NOW
            // condition += `ID(${object}) ${equality} {${i}} `;
        } else {
            condition += `${object}.${i} ${equality} {${i}} `;
        }
        j++;
    }

    return condition;
};

module.exports = query