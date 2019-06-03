// const neo4j = require('neo4j-driver').v1;

const fields = [
    'label'
];

class Tag {

    constructor (node){
        let data = node.properties || node;

        for (var i in fields){
            this[fields[i]] = data[fields[i]];
        }
        this._id = parseInt(data.uid);
		this.uid = this._id;

    }

}

module.exports = Tag;