const parser = require('../parser');
const queryEx = require('../query');
const SearchParams = require('../models/SearchParams');

const type = 'search_params';

parser.setSingle(type, function(record){
    return parseOneRecord(record);
})

function parseOneRecord(record){

    let entity;

    let node = record.get('sp');

    entity = new SearchParams(node);

    return entity;
}

let SearchParamsRepository = {

    getOneByUser        : function(user){

        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u:User)-[c:CRITERIA]->(sp:SearchParams)
                WHERE ID(u) = ${user._id}

                RETURN sp
            `;

            queryEx.exec(query)
            .then(results => {
                return resolve(parser.records(results, type, true));
            }).catch(err => {
                return reject(err);
            });
        });
    },

    updateOneWithUser   : function(searchParams, user){

        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u:User)
                WHERE ID(u) = ${user._id}

                MERGE (u)-[c:CRITERIA]->(sp:SearchParams)
                SET sp = $props

                RETURN sp
            `;

            let params = {
                props : searchParams
            }

            queryEx.exec(query, params)
            .then(results => {
                return resolve(parser.records(results, type, true));
            }).catch(err => {
                return reject(err);
            });
        });
    }

};

module.exports = SearchParamsRepository;