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
        let data = node.properties || node;
        params = params || {};

        transform(data);

        for (var i in fields){
            this[fields[i]] = data[fields[i]];
        }
        this._id = parseInt(data.uid);
        this.uid = this._id;

        if (node.main){
            this.main = node.main;
        }

        if (node.place){
            this.place = node.place;
        }

    }

}

module.exports = File;