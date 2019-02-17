// const neo4j = require('neo4j-driver').v1;

const fields = [
    'label'
];

class Tag {

    constructor (node){
        this._id = node.identity.low;
        let data = node.properties;

        for (var i in fields){
            this[fields[i]] = data[fields[i]];
        }

    }

}

module.exports = Tag;