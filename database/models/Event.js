const neo4j = require('neo4j-driver').v1;

const File = require('./File');


const fields = [
    'date', 'type',
    'read',
    'partner_id', 'partner_label'
];

const events = {
    1   : { label : 'liked', link : true},
    2   : { label : 'visited', link : true},
    3   : { label : 'match', link : true},
    4   : { label : 'unliked', link : false}
};

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


class Event {

    constructor (node, params){
        let data = node.properties;

        if (data){
            this._id = node.identity.low;
        } else {
            data = node;
            this._id = node._id.low;
        }

        transform(data);

        for (var i in fields){
            this[fields[i]] = data[fields[i]];
        }

        if (events[this.type]){
            this.label = events[this.type].label;
            this.link = events[this.type].link;
        }

        if (params.partner_picture){
            this.partner_picture = new File(params.partner_picture);
        }


        if (params.user){
            this.user_id = params.user.identity.low
        }
    }

}

module.exports = Event;