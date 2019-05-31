const parser = require('../parser');
const queryEx = require('../query');
const Location = require('../models/Location');

const type = 'location';

parser.setSingle(type, function(record){
    return parseOneRecord(record);
})

function parseOneRecord(record){

    let entity;

    let node = record.get('l');

    entity = new Location(node);

    return entity;
}

let LocationRepository = {

    createOne   : function(location){

        return new Promise((resolve, reject) => {

            let query = `
                CREATE (l:Location $location)
                RETURN l
            `;

            let params = {
                location    : location
            };

            queryEx.exec(query, params)
            .then(results => {
                return resolve(parser.records(results, type, true));
            }).catch(err => {
                return reject(err);
            });
        });
    },

    userLink    : function(location, user){

        return new Promise((resolve, reject) => {

            let query = `
                MATCH (u:User), (l:Location)
                WHERE ID(u) = ${user._id} AND ID(l) = ${location._id}

                OPTIONAL MATCH (u)-[oldli:LIVES {current:true}]->(oldl:Location)
                SET oldli.current = false
                CREATE (u)-[li:LIVES {current:true}]->(l)

                RETURN l
            `;

            queryEx.exec(query)
            .then(results => {
                return resolve(parser.records(results, type, true));
            }).catch(err => {
                return reject(err);
            });
        });
    }

};

module.exports = LocationRepository;