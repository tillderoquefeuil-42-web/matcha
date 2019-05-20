const passwordHash = require("password-hash");
const moment = require('moment');

const config = require('../../config/config');
const time = require('../utils/time');

const User = require('../../database/models/user.js');
const UserRepo = require('../../database/repositories/user.js');

const TagRepo = require('../../database/repositories/tag.js');
const LocationRepo = require('../../database/repositories/location.js');

const Files = require('../utils/files.js');
const FileRepo = require('../../database/repositories/File.js');

const fakeData = require('../../fake_data/data');


const required = [
    'firstname', 'lastname', 'username', 'email', 'password', 
    'gender', 'birthday', 'language'
];


function random() {
    return Math.round((Math.random())*100);
}

exports.getLastNames = function(){
    return fakeData.lastnames;
}

exports.getFirstNames = function(){
    return [fakeData.firstnames.m, fakeData.firstnames.f];
}

exports.getPicturePath = function(j, r){
    let picture = 'fake_data/pictures/profile_' + fakeData.pictures_path[fakeData.genders[j]];

    let nbr = r % (fakeData.genders[j] === 'female'? 130 : 50);
    picture += nbr + '.jpeg';

    return picture;
}

exports.generateUser = function(firstname, lastname, j){

    let r = random();
    let username = (firstname + '.' + lastname).toLowerCase();

    let age = config.params.MIN_AGED_USERS + 2 + r % 15;

    let gender = (r%3>0)? fakeData.genders[j] : fakeData.genders[2];

    let user = {
        firstname   : firstname,
        lastname    : lastname,
        username    : username,
        email       : 'tillderoquefeuil+' + username + '@gmail.com',
        password    : fakeData.password,
        language    : 'en',
        gender      : gender,
        bio         : fakeData.bios[r % (fakeData.bios.length + 5)],
        online      : time.toDatetime(moment().subtract(r, 'hours')),
        birthday    : time.toDatetime(moment().subtract(age, 'years')),
        picture_url : exports.getPicturePath(j, r)
    };

    return user;
}

exports.manageOrientation = function(user){
    let r = random();
    let orientations = [1];

    orientations.push(random() % 2);
    orientations.push(random() % 2);

    user.see_f = orientations[r % 3]? true : false;
    user.see_m = orientations[(r+1) % 3]? true : false;
    user.see_nb = orientations[(r+2) % 3]? true : false;

    return user;
}

exports.getRandomTags = function(user){
    let tagIndex;
    let r = random();
    user.tags = [];

    for (let j=1; j<5; j++){
        tagIndex = ((j * r) % fakeData.tags.length);
        if (fakeData.tags[tagIndex]){
            user.tags.push(fakeData.tags[tagIndex]);
        }
    }

    return user;
}

exports.getRandomCoords = function(user){
    let r = [
        random(), random(), random()
    ];

    let lat = ((r[0] + r[1] + 1) / (r[2]+1));
    let lng = ((r[2] + r[1] + 1) / (r[0]+1));

    while (lat > fakeData.coords.maxLat){
        lat = lat / 10;
    }

    while (lng > fakeData.coords.maxLng){
        lng = lng / 10;
    }

    let pos = {
        lat : (r[2] % 2)? -1 : 1,
        lng : (r[0] % 2)? -1 : 1
    }

    user.coords = {
        lat : (fakeData.coords.lat + (pos.lat * lat)),
        lng : (fakeData.coords.lng + (pos.lng * lng))
    };

    return user;
}

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
            bio         : data.bio,
            online      : data.online,
            password    : passwordHash.generate(data.password),
            valide      : true,
            providers   : ['local', 'test']
        }

        UserRepo.createOne(user)
        .then(_user => {
            TagRepo.updateUserTags(_user, data.tags)
            .then(_u => {
                LocationRepo.createOne(data.coords)
                .then(result => {
                    LocationRepo.userLink(result, _user)
                    .then(location => {
                        _user.location = location;

                        if (data.picture_url){
                            Files.saveFromUrl(_user, data.picture_url, 'img/jpeg')
                            .then(file => {
                                FileRepo.createOne(file.light())
                                .then(_file => {
                                    UserRepo.updateProfilePicture(_file, _user)
                                    .then(u => {
                                        return resolve(_user);
                                    });
                                });
                            });
                        } else {
                            return resolve(_user);
                        }

                    });
                });
            });
        }).catch(error => {
            return reject(error);
        });

    });
};