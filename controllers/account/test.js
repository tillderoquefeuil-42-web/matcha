const passwordHash = require("password-hash");

const User = require('../../database/models/user.js');
const UserRepo = require('../../database/repositories/user.js');

const TagRepo = require('../../database/repositories/tag.js');


const required = [
    'firstname', 'lastname', 'username', 'email', 'password', 
    'gender', 'birthday', 'language'
];

exports.createTestAccount = function(data) {

    return new Promise((resolve, reject) => {

        for (var i in required) {
            if (!data[required[i]]) {
                return reject("data missging : " + required[i]);
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

        UserRepo.createOne(user)
        .then(_user => {
            TagRepo.updateUserTags(_user, data.tags)
            .then(_user => {
                return resolve(_user);
            });
        }).catch(error => {
            return reject(error);
        })

    });
};