const neo4j = require('neo4j-driver').v1;

const fields = [
    'id', 'date', 'filename', 'type', 'size'
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

class File {

    constructor (node, params){
        this._id = node.identity.low;
        let data = node.properties;

        transform(data);

        for (var i in fields){
            this[fields[i]] = data[fields[i]];
        }

    }

}

module.exports = File;