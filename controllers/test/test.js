const passwordHash = require("password-hash");
const moment = require('moment');

const config = require('../../config/config');
const fakeData = require('../../fake_data/data');
const Time = require('../utils/time');

const UserRepo = require('../../database/repositories/user.js');
const MatchRepo = require('../../database/repositories/Match.js');
const VisitRepo = require('../../database/repositories/Visit.js');

const TagRepo = require('../../database/repositories/tag.js');
const LocationRepo = require('../../database/repositories/location.js');

const Files = require('../utils/files.js');
const FileRepo = require('../../database/repositories/File.js');

const required = [
    'firstname', 'lastname', 'username', 'email', 'language', 'gender', 'birthday',
    'see_f', 'see_m', 'see_nb', 'bio', 'online', 'password', 'valide', 'providers'
];


function random() {
    return Math.round((Math.random())*100);
}

function reindexArray(array){
    let a = [];

    for (let i in array){
        if (array[i]){
            a.push(array[i]);
        }
    }

    return a;
}

function getUsername(firstname, lastname){
    return (firstname + '.' + lastname).toLowerCase();
}

function getAge(r) {
    return config.params.MIN_AGED_USERS + r % 12;
}

function getGender(r, j) {
    return (r%3>0)? fakeData.genders[j] : fakeData.genders[2];
}

function getEmail(username) {
    return 'tillderoquefeuil+' + username + '@gmail.com';
}

function getBio(r) {
    let index = r % (fakeData.bios.length + 5);
    if (index >= fakeData.bios.length){
        return null;
    }

    return fakeData.bios[index];
}

function getOnline(r) {
    return Time.toDatetime(moment().subtract(r, 'hours'));
}

function getBirthday(age) {
    return Time.toDatetime(moment().subtract(age, 'years'));
}

function getPicturePath(j, r){
    let picture = 'fake_data/pictures/profile_' + fakeData.pictures_path[fakeData.genders[j]];

    let nbr = r % (fakeData.genders[j] === 'female'? 130 : 50);
    picture += nbr + '.jpeg';

    return picture;
}

function manageOrientation(user){
    let r = random();
    let orientations = [1];

    orientations.push(random() % 2);
    orientations.push(random() % 2);

    user.see_f = orientations[r % 3]? true : false;
    user.see_m = orientations[(r+1) % 3]? true : false;
    user.see_nb = orientations[(r+2) % 3]? true : false;

    return user;
}

function getRandomTags(user){
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

function getRandomCoords(user){
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

exports.getLastNames = function(){
    return fakeData.lastnames;
};

exports.getFirstNames = function(){
    return [fakeData.firstnames.m, fakeData.firstnames.f];
};

exports.generateUser = function(firstname, lastname, j){

    let r = random();

    let username = getUsername(firstname, lastname);
    let age = getAge(r);

    let user = {
        //CONST
        valide      : true,
        providers   : ['local', 'test'],
        language    : fakeData.language,
        password    : passwordHash.generate(fakeData.password),

        firstname   : firstname,
        lastname    : lastname,
        username    : username,

        gender      : getGender(r, j),
        email       : getEmail(username),
        bio         : getBio(r),
        online      : getOnline(r),
        birthday    : getBirthday(age),
        picture_url : getPicturePath(j, r)
    };

    manageOrientation(user);
    getRandomTags(user);
    getRandomCoords(user);

    return user;
};

exports.createTestAccount = function(data) {

    return new Promise((resolve, reject) => {

        var user = {};

        for (var i in required) {
            let label = required[i];
            if (typeof data[label] === 'undefined') {
                return reject("data missing : " + label);
            }

            user[label] = data[label]
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
                                    UserRepo.updateUserPicture(_file, _user, {place:'picture_0', main:true})
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
            console.log(error);
            return reject(error);
        });

    });
};

exports.getFakeProfiles = function() {
    return UserRepo.getFakesProfiles();
};

exports.randomMatching = function(fake) {

    return new Promise((resolve, reject) => {

        let r = (random() % 9) + 1;
        UserRepo.matching(fake, {limit:r})
        .then(matches => {

            let length = matches.length;
            if (!length){
                return resolve(fake);
            }

            let count = 0;

            for (var i=0; i<r; i++){
                if (!matches[i]){
                    return resolve(fake);
                }

                let partnerId = matches[i]._id;

                MatchRepo.mergeMatch(fake, partnerId)
                .then(match => {
                    VisitRepo.add(fake._id, partnerId)
                    .then(match => {
                        if (i % 3 === 0){
                            count++;
                            if (count === r){
                                return resolve(fake);
                            }
                        } else {
                            MatchRepo.likeMatch(fake, partnerId, true)
                            .then(match => {
                                count++;
                                if (count === r){
                                    return resolve(fake);
                                }
                            });
                        }
                    });
                });
            }
        }).catch(error => {
            return reject(error);
        });
    });

};

exports.createRecursive = function(data, i) {

    return new Promise((resolve, reject) => {

        process.stdout.write('-> ' + i + '/' + data.max + "\r");

        if (i >= data.max){
            process.stdout.write("Done.             \r");
            console.log('');
            return resolve(true);
        }

        let r = random();
        let lastname = data.lastNames[i];

        let j = i%2;

        let index = r % data.firstNames[j].length;
        let firstname = data.firstNames[j][index];
        delete data.firstNames[j][index];
        data.firstNames[j] = reindexArray(data.firstNames[j]);

        let user = this.generateUser(firstname, lastname, j);
        this.createTestAccount(user)
        .then(user => {
            exports.createRecursive(data, ++i)
            .then(result => {
                return resolve(result);
            });
        }).catch(err => {
            console.log(err);
            return reject(err);
        });
    });
}

exports.matchingRecursive = function(fakes, i) {

    return new Promise((resolve, reject) => {
        process.stdout.write('-> ' + i + '/' + fakes.length + "\r");
        
        if (i >= fakes.length){
            process.stdout.write("Done.             \r");
            console.log('');
            return resolve(true);
        }

        this.randomMatching(fakes[i])
        .then(results => {
            exports.matchingRecursive(fakes, ++i)
            .then(result => {
                return resolve(result);
            });
        }).catch(err => {
            console.log(err);
            return reject(err);
        });
    });
}

