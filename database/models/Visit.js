const neo4j = require('neo4j-driver').v1;

const fields = [
    'user_id', 'host_id', 'date'
];

function transform(object) {
    for (let property in object) {
        if (object.hasOwnProperty(property)) {
            const propertyValue = object[property];
            if (neo4j.isInt(propertyValue)) {
                object[property] = propertyValue.toString();
            } else if (typeof propertyValue === 'object') {
                transform(propertyValue);
            }
        }
    }
}


class Visit {

    constructor (node, params){
        let data = node.properties || node;

        transform(data);

        for (var i in fields){
            this[fields[i]] = data[fields[i]];
        }

        this._id = parseInt(data.uid);

        if (params.user){
            this.user_id = params.user.identity.low
        }

        if (params.host){
            this.host_id = params.host.identity.low
        }
    }

}

module.exports = Visit;