let parser = {};

parser.singles = {};
parser.merges = {};

parser.setSingle = function(type, funct){
    if (typeof funct === 'function'){
        parser.singles[type] = funct;
    }
}

parser.setMerges = function(type, merges){
    parser.merges[type] = merges;
}

parser.unique = function(results){
    let entity = null;

    if (results && results.length >= 1){
        entity = results[0];
    }

    return entity;
}

parser.records = function(data, type, unique){
    let entities = {};

    for (let i in data.records){

        let record = data.records[i];
        let n = parser.singles[type](record);
        let _id = n._id;

        if (entities[_id] && parser.merges[type]){
            entities[_id] = parser.merging(entities[_id], n, parser.merges[type]);
        } else {
            entities[_id] = n;
        }
    }

    entities = Object.values(entities);

    if (unique){
        return parser.unique(entities);
    }

    return entities;
}

parser.merging = function(n, node, properties){
    let data = {};
    let tmp;

    for (let i in properties){
        tmp = parser.oneMerging(n, node, properties[i]);
        data[properties[i]] = tmp[properties[i]];
    }

    for (let i in data){
        n[i] = data[i];
    }

    return n;
}

parser.oneMerging = function(n, node, property){

    if (!n[property]){
        return node;
    } else if (!node[property]){
        return n;
    }

    n[property] = n[property].concat(node[property]);
    return n;
}

module.exports = parser;