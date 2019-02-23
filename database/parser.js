let parser = {};

parser.singles = {};
parser.merges = {};

function objectLength(object){
    let length = 0;
    for (let i in object){
        length++;
    }
    return length;
}

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

    let data = {};
    parser.parseOneNodeProperty(data, n[property]);
    parser.parseOneNodeProperty(data, node[property]);

    n[property] = Object.values(data);
    return n;
}

parser.parseOneNodeProperty = function(data, nodeProperty){

    let length = objectLength(data);

    for (let i in nodeProperty){
        let elem = nodeProperty[i];

        if (typeof elem === 'object'){
            let id = elem._id? elem._id : length + i;
            data[id] = elem;
            continue;
        }

        if (typeof elem === 'string'){
            let array = Object.values(data);
            if (array.indexOf(elem) === -1){
                data[length + i] = elem;
            }
            continue;
        }

        data[length + i] = elem;
    }

    return data;
}

module.exports = parser;