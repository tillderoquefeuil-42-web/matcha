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
                MATCH (u:User {uid:${user._id}})-[c:CRITERIA]->(sp:SearchParams)

                RETURN sp
            `;

            queryEx.exec(query)
            .then(results => {
                let searchParams = parser.records(results, type, true) || new SearchParams();
                return resolve(searchParams);
            }).catch(err => {
                return reject(err);
            });
        });
    },

    updateOneWithUser   : function(searchParams, user){

        return new Promise((resolve, reject) => {

            let query = `
                MERGE (id:UniqueId {name:'${type}'})
                ON CREATE SET id.count = 1

                WITH id
                MATCH (u:User {uid:${user._id}})

                MERGE (u)-[c:CRITERIA]->(sp:SearchParams)
                ON CREATE SET id.count = id.count + 1, sp.uid = id.count
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