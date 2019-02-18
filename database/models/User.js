const neo4j = require('neo4j-driver').v1;

const passwordHash = require('password-hash');
const jwt = require('jwt-simple');

const config = require('../../config/config');
const Files = require('../../controllers/utils/files.js');

const Location = require('../models/Location');

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

        for (var i in fields){
            this[fields[i]] = data[fields[i]];
        }

        if (passwordHash.isHashed(data.password)){
            this.password = data.password;
        } else if (data.password) {
            this.password = passwordHash.generate(data.password);
        }

        if (params.profile_pic){
            let file = params.profile_pic.properties;
            transform(file);
            file.url = Files.getFilePath() + file.filename;

            this.profile_pic = file;
        }

        if (params.tags){
            this.tags = params.tags;
        }

        if (params.location){
            this.location = new Location(params.location);
        }

    }

    authenticate(password) {
		return passwordHash.verify(password, this.password);
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