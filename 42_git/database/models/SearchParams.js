const neo4j = require('neo4j-driver').v1;

const time = require('../../controllers/utils/time');

const defaultParams = require('../../config/config').MATCHING;

const fields = [
    'distance', 'age_min', 'age_max', 'rate_min', 'rate_max'
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



class SearchParams {

    constructor (node, params){
        if (node){
            let data = node.properties || node;

            transform(data);
            for (var i in fields){
                this[fields[i]] = data[fields[i]];
            }

            this._id = parseInt(data.uid);
		this.uid = this._id;
        }

        if (!this.distance){
            this.distance = defaultParams.DISTANCE;
        }

        if (!this.age_min){
            let n = new Date()
            n.setFullYear(n.getUTCFullYear() - defaultParams.AGE.MIN);
            this.age_min = time.toDatetime(n);
        }

        if (!this.age_max){
            let n = new Date()
            n.setFullYear(n.getUTCFullYear() - defaultParams.AGE.MAX);
            this.age_max = time.toDatetime(n);
        }

        if (!this.rate_min){
            this.rate_min = defaultParams.RATE.MIN;
        }

        if (!this.rate_max){
            this.rate_max = defaultParams.RATE.MAX;
        }

    }

}

module.exports = SearchParams;