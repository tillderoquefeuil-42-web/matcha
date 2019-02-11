const passwordHash = require("password-hash");

const User = require('../../database/models/user.js');
const UserRepo = require('../../database/repositories/user.js');


exports.createTestAccount = function(data) {

    const required = [
        'firstname', 'lastname', 'username', 'email', 'password', 
        'gender', 'birthday', 'orientation', 'language'
    ];

    for (var i in required) {
        if (!data[required[i]]) {
            return false;
        }
    }
    
    var user = {
        firstname   : data.firstname,
        lastname    : data.lastname,
        username    : data.username,
        email       : data.email,
        language    : data.language,
        gender      : data.gender,
        birthday    : data.birthday,
        orientation : data.orientation,
        password    : passwordHash.generate(data.password),
        valide      : true,
        providers   : ['local', 'test']
    }

    var _u = new User(user);
    return UserRepo.createOne(_u);
};