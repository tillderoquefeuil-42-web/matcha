const neo4j = require('neo4j-driver').v1;

const passwordHash = require('password-hash');
const jwt = require('jwt-simple');

const config = require('../../config/config');
const time = require('../../controllers/utils/time');

const Location = require('../models/Location');
const File = require('./File');

const fields = [
    'email', 'username', 'firstname', 'lastname',
    'valid', 'locked', 'connection_try',
    'providers', 'googleId', 'birthday',
    'gender', 'see_m', 'see_f', 'see_nb',
    'bio', 'profile_picture', 'language'
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

class User {

    constructor (node, params){
        this._id = node.identity.low;
        let data = node.properties;

        params = params || {};
        transform(data);

        for (var i in fields){
            this[fields[i]] = data[fields[i]];
        }

        if (passwordHash.isHashed(data.password)){
            this.password = data.password;
        } else if (data.password) {
            this.password = passwordHash.generate(data.password);
        }

        if (data.distance){
            this.distance = data.distance;
        }

        if (data.common_tags){
            this.common_tags = parseInt(data.common_tags);
        }

        if (params.profile_pic){
            this.profile_pic = new File(params.profile_pic);
        }

        this.pictures = [];
        for (let i in params.others){
            this.pictures.push(new File(params.others[i]));
        }

        if (params.tags){
            this.tags = params.tags;
        }

        if (params.location){
            this.location = new Location(params.location);
        }

        if (this.birthday){
            this.age = time.getAgeFromTime(this.birthday);
        }

    }

    getPassword() {
        return this.password;
    }

    setPassword(pswd) {
        this.password = pswd;
    }

    authenticate(password) {
		return passwordHash.verify(password, this.getPassword());
	}
	
	getToken() {
		return jwt.encode(this, config.secret);
	}

	getName() {
		return this.firstname + ' ' + this.lastname;
	}

    isLocal() {
        if (this.providers.indexOf('local') !== -1){
            return true;
        }

        return false;
    }

}

module.exports = User;