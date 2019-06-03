const neo4j = require('neo4j-driver').v1;

const fields = [
    'street_number', 'route', 'locality', 'country', 'postal_code', 'lat', 'lng'
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

class Location {

    constructor (node, params){
        let data = node.properties || node;

        transform(data);

        for (var i in fields){
            this[fields[i]] = data[fields[i]];
        }

        this._id = parseInt(data.uid);
		this.uid = this._id;

        this.label = this.getLabel();
    }

    getLabel() {
        let label = '';

        if (this.street_number){
            label += `${this.street_number} `;
        } if (this.route){
            label += `${this.route}, `;
        } if (this.postal_code){
            label += `${this.postal_code} `;
        } if (this.locality){
            label += `${this.locality}, `;
        } if (this.country){
            label += `${this.country}`;
        }

        return label;
    }

}

module.exports = Location;