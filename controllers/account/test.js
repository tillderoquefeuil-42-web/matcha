const passwordHash = require("password-hash");

const User = require('../../database/models/user.js');
const UserRepo = require('../../database/repositories/user.js');


exports.createTestAccount = function(data) {

    const required = [
        'firstname', 'lastname', 'username', 'email', 'password', 
        'gender', 'birthday', 'see_f', 'see_m', 'see_nb', 'language'
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
        see_f       : data.see_f,
        see_m       : data.see_m,
        see_nb      : data.see_nb,
        password    : passwordHash.generate(data.password),
        valide      : true,
        providers   : ['local', 'test']
    }

    var _u = new User(user);
    return UserRepo.createOne(_u);
};