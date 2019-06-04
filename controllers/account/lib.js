const passwordHash = require("password-hash");
const jwt = require('jwt-simple');
const moment = require('moment');

const User = require('../../database/models/user.js');

const TagRepo = require('../../database/repositories/Tag.js');
const UserRepo = require('../../database/repositories/User.js');
const FileRepo = require('../../database/repositories/File.js');
const VisitRepo = require('../../database/repositories/Visit.js');
const EventRepo = require('../../database/repositories/Event.js');
const MatchRepo = require('../../database/repositories/Match.js');
const LocationRepo = require('../../database/repositories/Location.js');
const SearchParamsRepo = require('../../database/repositories/SearchParams.js');

const Com = require('./communication.js');
const config = require('../../config/config');

const Time = require('../utils/time');
const Files = require('../utils/files');


// UTILS

function manageResSuccess(res, params){

    params = params || {};

    params.status = 200;
    params.text = 'SUCCESS';

    res.status(200).json(params);
    return res;
}

function manageResError(res, params, status){

    let text;
    if (typeof params === 'string'){
        text = params;
        params = null;
    }
    params = params || {};

    status = status || params.status || 500;
    text =  text || params.text || 'INTERNAL_ERROR'

    params.status = status;
    params.text = text;
    params.error = true;

    res.status(200).json(params);
    return res;
}

function errorRedirect(res, method, params) {

    method = method || 'POST';
    let link = `http://${config.client.hostname}:${config.client.port}/error`;
    
    if (method === 'POST') {
        params = params || {};
        params.status = params.status || 400;
        params.redirect = params.link || link;

        return manageResError(res, params);
    } else {
        res.redirect(link);
    }
    
    return res;
}

function decodeToken(token) {
    let decoded = {};

    try {
        decoded = jwt.decode(token, config.secret);

        if (!decoded._id || !decoded.email) {
            decoded.error_txt = "INVALID_TOKEN";
        }
    } catch (err) {
        decoded.error = err;
        decoded.error_txt = "BAD_TOKEN";
    }

    return decoded;
}

function connectionTry(user, valid, callback) {

    if (valid) {
        user.connection_try = 0;
    } else {
        user.connection_try++;
    } if (user.connection_try >= config.params.MAX_SIGN_IN_TRY) {
        user.locked = true;
    }

    return UserRepo.updateOne(user)
    .then(result => {
        if (callback){
            callback(null, user);
        }
    }).catch(err => {
        if (callback){
            callback(err, null);
        }
    });
}

exports.getUserByToken = function(req, res, callback, errorCallback) {
    if (!req.body._token) {
        return manageResError(res, 'NO_TOKEN', 401);
    }
    
    if (req.user){
        return callback(req.user);
    }
    
    return this.getUserFromToken(req.body._token)
    .then(user => {
        if (user == null) {
            if (errorCallback) {
                errorCallback(err, user);
            } else {
                return manageResError(res, 'USER_NOT_FOUND', 404);
            }
            
        } else if (callback) {
            callback(user);
            
        } else {
            return manageResSuccess(res, {user : user});
        }
    }).catch(err => {
        if (errorCallback) {
            errorCallback(err, null);
        } else {
            return manageResError(res, 'DATABASE_CRASHED', 400);
        }
    });
}

function findUserByUsernames(usernames, callback) {

    UserRepo.findAnd({
        username: usernames
    }).then(users => {
        callback(null, users);
    }).catch(err => {
        callback(err, null);
    });

    return;
}

function findUserByEmails(emails, callback) {

    UserRepo.findAnd({
        email: emails
    }).then(users => {
        callback(null, users);
    }).catch(err => {
        callback(err, null);
    });

    return;
}

function findGoogleProfile(profile, callback) {

    if (!profile.googleId) {
        callback(null, null);
    }

    UserRepo.findOne({
        googleId    : profile.googleId
    }).then(user => {
        callback(null, user);
    }).catch(err => {
        callback(err, null);
    });
}

function anonymizeProfiles(profiles){
    let data = [];
    let single = false;

    if (!profiles){
        return null;
    }

    if (profiles && profiles._id){
        profiles = [profiles];
        single = true;
    }

    for (let i in profiles){
        data.push(anonymizeOneProfile(profiles[i]));
    }
    
    if (single && data.length === 1){
        return data[0];
    }
    return data;
}

function anonymizeOneProfile(profile){
    let toDelete = ['birthday', 'email', 'gender', 'language', 'location', 'password', 'providers', 'see_f', 'see_m', 'see_nb', 'username']

    for (let i in toDelete){
        delete profile[toDelete[i]];
    }

    profile.anonymized = true;
    profile.lastname = profile.lastname[0] + '.';

    return profile;
}

exports.getUserFromToken = function(token) {

    return new Promise((resolve, reject) => {

        if (!token) {
            return resolve(null);
        }

        let decoded = decodeToken(token);
        if (decoded.error) {
            return resolve(null);
        }

        UserRepo.findOne({
            email   : decoded.email
        }).then(function(user){
            return resolve(user);
        }, function(err){
            console.log(err)
            return reject(err);
        });
    });
}

// POST

exports.findOrCreate = function(profile, callback) {

    return new Promise(function (resolve, reject) {

        if (profile.googleId) {
            findGoogleProfile(profile, function (err, user) {
                if (err) {
                    reject(500);
                } else if (!user) {
                    resolve(null);
                } else {
                    resolve(user);
                }
            });
        }

    }).then(function(user) {

        if (user) {
            return callback(null, user);
        }

        UserRepo.createOne(profile)
        .then(_user => {
            return callback(null, _user);
        }).catch(err => {
            return callback(err, null);
        });
        
    }, function (error) {
        return callback(error, null);
    });

};

exports.signUp = function(req, res) {

    const required = ['firstname', 'lastname', 'username', 'email', 'password', 'language'];

    for (var i in required) {
        if (!req.body[required[i]]) {
            return manageResError(res, 'INVALID_PARAMETERS', 400);
        }
    }
    
    var user = {
        firstname   : req.body.firstname,
        lastname    : req.body.lastname,
        username    : req.body.username,
        email       : req.body.email,
        language    : req.body.language,
        password    : passwordHash.generate(req.body.password),
        providers   : ['local'],
        see_m       : true,
        see_f       : true,
        see_nb      : true
    }

    var findUser = new Promise(function (resolve, reject) {

        UserRepo.findOr({
            email       : req.body.email,
            username    : req.body.username
        }).then(result => {
            if (result && result.length > 0) {
                reject({
                    status  : 403,
                    label   : (result[0].email === req.body.email)? 'USER_ALREADY_EXIST' : 'USER_NAME_EXIST'
                });
            } else {
                resolve(true);
            }
        }).catch(err => {
            reject({status : 500});
        });
    });

    findUser.then(function () {

        UserRepo.createOne(user)
        .then(_user => {

            Com.signUp.send(_user);
            return manageResSuccess(res, {token : _user.getToken()});
        }).catch(err => {
            return manageResError(res);
        });

    }, function (error) {
        return manageResError(res, error.label, error.status);
    }); 
};

exports.checkUsernames = function(req, res) {

    if (typeof req.body.usernames !== 'object' || !req.body.usernames.length) {
        return manageResError(res, 'INVALID_PARAMETERS', 400);
    }

    let length = req.body.usernames.length;
    let userId = req.body.user_id;

    findUserByUsernames(req.body.usernames, function(err, users) {

        if (err) {
            console.log(err);
            return manageResError(res);
        } else if (!users || !users.length) {
            return manageResSuccess(res);
        } else if (users.length === 1 && String(users[0]['_id']) === String(userId)) {
            return manageResSuccess(res);
        } else if (users && users.length > 0 && length > users.length) {
            let alreadyUsed = [];
            for (let i in users){
                alreadyUsed.push(users[i].username);
            }
            return manageResSuccess(res, {already_used : alreadyUsed});
        } else if (users && users.length > 0) {
            return manageResError(res, {
                status: 403,
                text  : "USER_NAME_EXIST",
                users : users
            });
        } else {
            return manageResSuccess(res);
        }
    });

    return;
};

exports.signIn = function(req, res) {

    if (!req.body.username || !req.body.password) {
        return manageResError(res, 'INVALID_PARAMETERS', 400);
    }

    UserRepo.findLocalByUsernameOrEmail(req.body.username)
    .then(user => {
        if(!user) {
            return manageResError(res, 'USER_NOT_EXIST', 401);
        }

        let lockedLink = `http://${config.client.hostname}:${config.client.port}/user/lockedAccount?email=${user.email}`;

        if (user.locked === true) {
            return errorRedirect(res, 'POST', {status:401, link:lockedLink});
        }

        if (user.authenticate(req.body.password)) {
            connectionTry(user, true);

            return manageResSuccess(res, {token : user.getToken()});
        } else {
            connectionTry(user, false, function (err, user) {
                
                if (err) {
                    console.log(err);
                    return errorRedirect(res);
                };
                
                if (user.locked === true) {
                    Com.lockedAccount.send(user);
                    return errorRedirect(res, 'POST', {status:401, link:lockedLink});
                }

                return manageResError(res, 'INVALID_PASSWORD', 401);
            });
        }
    }).catch(err => {
        console.log(err);
        return manageResError(res);
    });

};

exports.auth = function(req, res) {

    return exports.getUserByToken(req, res, function(user) {
        return manageResSuccess(res, {user : user});
    });

};

exports.resetPassword = function(req, res) {
    if (!req.body.email) {
        return manageResError(res, 'INVALID_PARAMETERS', 400);
    }

    UserRepo.findOne({
        email: req.body.email
    }).then(user => {
        if (!user) {
            return manageResError(res, 'USER_NOT_EXIST', 401);
        } else {
            Com.resetPassword.send(user);
            return manageResSuccess(res);
        }
    }).catch(err => {
        return manageResError(res);
    });
    
};

exports.savePswdByToken = function(req, res) {
    
    if (!req.body.token || !req.body.password) {
        return manageResError(res, 'INVALID_PARAMETERS', 400);
    }
    
    req.body._token = req.body.token;
    
    return exports.getUserByToken(req, res, function(user) {
        
        user.locked = false;
        user.connection_try = 0;
        user.password = passwordHash.generate(req.body.password);
        if (user.providers.indexOf('local') === -1) {
            user.providers.push('local');
        }
        
        UserRepo.updateOne(user)
        .then(_user => {
            return manageResSuccess(res, {user : _user});
        }).catch(err => {
            return manageResError(res);
        });
    });

};

exports.sendLockedAccount = function(req, res) {
    if (!req.body.email) {
        return manageResError(res, 'INVALID_PARAMETERS', 400);
    }

    UserRepo.findOne({email : req.body.email})
    .then(user => {
        if (!user) {
            return manageResError(res, 'USER_NOT_EXIST', 401);
        } else if (user.locked === true) {
            Com.lockedAccount.send(user);
            return manageResSuccess(res);
        }
    }).catch(err => {
        return manageResError(res);
    });
};

exports.saveUser = function(req, res) {

    if (!req.body.user) {
        return manageResError(res, 'INVALID_PARAMETERS', 400);
    }

    let _user = req.body.user;
    let error = false

    // CHECK EMPTY PARAMETERS
    const notNullable = ['firstname', 'lastname', 'username', 'gender', 'birthday', 'language'];
    for (var i in notNullable) {
        if (!_user[notNullable[i]]) {
            error = true
            break;
        }
    }

    // CHECK LANGUAGE
    const languages = ['en', 'fr'];
    if (languages.indexOf(_user.language) === -1){
        error = true
    }

    // CHECK GENDER
    const genders = ['male', 'female', 'nb'];
    if (genders.indexOf(_user.gender) === -1){
        error = true
    }

    // CHECK ORIENTATION
    if (!_user.see_f && !_user.see_m && !_user.see_nb){
        error = true
    }

    if (error) {
        return manageResError(res, 'INVALID_PARAMETERS', 400);
    }

    // CHECK BIRTHDAY
    let maxDate = moment().subtract(config.params.MIN_AGED_USERS, 'years');
    if (moment(_user.birthday) > maxDate) {
        return manageResError(res, 'USER_TOO_YOUNG', 401);
    }
    
    return exports.getUserByToken(req, res, function(user) {
        
        // USERNAME
        findUserByUsernames([_user.username], function(err, users) {
            
            if (err) {
                return manageResError(res);
            }

            let error = 0;
            if (users && users.length === 1 && String(users[0]['_id']) !== String(user._id)) {
                error++;
            } else if (users && users.length > 1) {
                error++;
            } if (error > 0) {
                return manageResError(res, {
                    text    : "USERNAME_EXIST",
                    users   : users,
                    user    : user
                }, 401);
            }
            
            // TO UPDATE
            const fields = ['bio', 'firstname', 'lastname', 'username', 'gender', 'birthday', 'language', 'see_f', 'see_m', 'see_nb', 'uid'];
            const unwanted = ['profile_pic', 'profile_picture', 'tags', 'pictures', 'location'];
            for (var i in fields) {
                user[fields[i]] = _user[fields[i]];
            }
            for (var i in unwanted) {
                delete user[unwanted[i]];
            }

            _user.tags = _user.tags || [];
            
            TagRepo.updateUserTags(user, _user.tags)
            .then(r => {
                UserRepo.updateOne(user)
                .then(_u => {
                    return manageResSuccess(res, {user : _u});
                }).catch(err => {
                    console.log(err);
                    return manageResError(res);
                });
            });
            return;
        });
    });
};

exports.saveNewPassword = function(req, res) {
    if (!req.body.password) {
        return manageResError(res, 'INVALID_PARAMETERS', 400);
    }
    
    return exports.getUserByToken(req, res, function(user) {
        
        if (user.providers.indexOf('local') === -1 || user.authenticate(req.body.old_password)) {
            
            if (user.providers.indexOf('local') === -1) {
                user.providers.push('local');
            }
            
            user.password = passwordHash.generate(req.body.password);
            
            // NO UPDATE ON :
            const unwanted = ['profile_pic', 'profile_picture', 'tags', 'pictures', 'location'];
            for (var i in unwanted) {
                delete user[unwanted[i]];
            }
            
            UserRepo.updateOne(user)
            .then(_user => {
                return manageResSuccess(res, {
                    user    : _user,
                    token   : _user.getToken()
                });
            }).catch(err => {
                return manageResError(res);
            });
            
        } else {
            return manageResError(res, 'INVALID_PASSWORD', 401);
        }
    });
};

exports.saveNewEmail = function(req, res) {
    if (!req.body.email || !req.body.password) {
        return manageResError(res, 'INVALID_PARAMETERS', 400);
    }

    return exports.getUserByToken(req, res, function(user) {

        if (user.authenticate(req.body.password)) {

            findUserByEmails([req.body.email], function(err, users) {
                if (err) {
                    console.log(err);
                    return manageResError(res);
                } else if (users && users.length === 1 && String(users[0]['_id']) === String(user._id)) {
                    return manageResSuccess(res)
                } else if (users && users && users.length > 0) {
                    return manageResError(res, {
                        text  : "USER_ALREADY_EXIST",
                        users : users
                    }, 403);
                } else {
                    user.valid = false;
                    user.email = req.body.email;
                    
                    UserRepo.updateOne(user)
                    .then(result => {
                        Com.validateEmailAddress.send(user);
                        return manageResSuccess(res, {
                            user    : user,
                            token   : user.getToken()
                        });
                    }).catch(err => {
                        return manageResError(res);
                    });
                    return;
                }
            });
            
        } else {
            return manageResError(res, 'INVALID_PASSWORD', 401);
        }
    });
};

exports.saveLocation = function(req, res) {
    
    if (!req.body.location) {
        return manageResError(res, 'INVALID_PARAMETERS', 400);
    }
    
    return exports.getUserByToken(req, res, function(user) {
        LocationRepo.createOne(req.body.location)
        .then(result => {
            LocationRepo.userLink(result, user)
            .then(location => {
                user.location = location;
                return manageResSuccess(res, {user : user});
            });
        }).catch(err => {
            console.log(err);
            return manageResError(res);
        });
    });
};

exports.deleteAccount = function(req, res){
    
    return exports.getUserByToken(req, res, function(user) {
        
        if (!user.isLocal() || user.authenticate(req.body.password)) {
            UserRepo.deleteOne(user)
            .then(results => {
                return manageResSuccess(res);
            }).catch(err => {
                console.log(err);
                return manageResError(res);
            });
            return;
        }
        
        return manageResError(res, 'INVALID_PASSWORD', 401);
    });
};

exports.getTags = function(req, res){
    TagRepo.getAll()
    .then(results => {
        return manageResSuccess(res, {tags : results});
    }).catch(err => {
        console.log(err);
        return manageResError(res);
    });
};


// GET

exports.validateAccount = function(req, res) {

    if (!req.query.token) {
        return errorRedirect(res, 'GET');
    }

    req.body._token = req.query.token;

    return exports.getUserByToken(req, res, function(user) {
        
        if (user.valid) {
            return res.redirect(`http://${config.client.hostname}:${config.client.port}/user/validateAccount?valid=1`);
        }
        
        user.valid = true;

        UserRepo.updateOne(user)
        .then(result => {
            res.redirect(`http://${config.client.hostname}:${config.client.port}/user/validateAccount`);
        }).catch(err => {
            return errorRedirect(res, 'GET');
        });

    }, function(err, user) {
        return errorRedirect(res, 'GET');
    });

};

exports.unlockAccount = function(req, res) {

    if (!req.query.token) {
        return errorRedirect(res, 'GET');
    }

    req.body._token = req.query.token;

    return exports.getUserByToken(req, res, function(user) {

        if (!user.locked) {
            return res.redirect(`http://${config.client.hostname}:${config.client.port}/`);
        }

        user.locked = false;
        user.connection_try = 0;

        UserRepo.updateOne(user)
        .then(result => {
            res.redirect(`http://${config.client.hostname}:${config.client.port}/user/lockedAccount?unlocked=1`);
        }).catch(err => {
            return errorRedirect(res, 'GET');
        });

    }, function(err, user) {
        return errorRedirect(res, 'GET');
    });

};





// ***** ***** SOCKET ***** ***** //

// GET

exports.loadContacts = function(user){

    let data = {
        friends : [],
        error   : null
    };

    return new Promise((resolve, reject) => {

        if (!user){
            data.error = "INVALID_PARAMETERS";
            return reject(data);
        }

        UserRepo.findAllFriends(user)
        .then(friends => {
            data.friends = anonymizeProfiles(friends);
            return resolve(data);

        }).catch(err => {
            console.log(err);
            data.error = "INTERNAL_ERROR";
            return reject(data);
        });
    });
};

exports.loadMatches = function(user, options){

    let data = {
        matches : [],
        error   : null
    };

    return new Promise((resolve, reject) => {

        if (!user){
            data.error = "INVALID_PARAMETERS";
            return reject(data);
        }

        UserRepo.matching(user, options)
        .then(matches => {
            data.matches = anonymizeProfiles(matches);
            return resolve(data);

        }).catch(err => {
            console.log(err);
            data.error = "INTERNAL_ERROR";
            return reject(data);
        });
    });
};

exports.loadOneMatch = function(user, partnerId){

    let data = {
        match   : null,
        error   : null
    };

    return new Promise((resolve, reject) => {

        if (!user){
            data.error = "INVALID_PARAMETERS";
            return reject(data);
        }

        UserRepo.getUpdatedPartner(user, partnerId)
        .then(match => {
            data.match = anonymizeProfiles(match);
            return resolve(data);

        }).catch(err => {
            console.log(err);
            data.error = "INTERNAL_ERROR";
            return reject(data);
        });
    });
};

exports.loadMatchedProfiles = function(user){

    let data = {
        matched : [],
        error   : null
    };

    return new Promise((resolve, reject) => {

        if (!user){
            data.error = "INVALID_PARAMETERS";
            return reject(data);
        }

        UserRepo.matchedProfiles(user)
        .then(matched => {
            data.matched = anonymizeProfiles(matched);
            return resolve(data);

        }).catch(err => {
            console.log(err);
            data.error = "INTERNAL_ERROR";
            return reject(data);
        });
    });
};

exports.loadSearchParams = function(user){

    return new Promise((resolve, reject) => {
        SearchParamsRepo.getOneByUser(user)
        .then(searchParams => {
            return resolve(searchParams);
        }).catch(err => {
            console.log(err);
            return reject(err);
        });
    });
};

exports.getAllVisits = function(user){
    let data = {};

    return new Promise((resolve, reject) => {
        VisitRepo.findByUser(user._id)
        .then(visits => {
            data.visits = visits;

            let ids = [];
            for (let i in visits){
                ids.push(visits[i].host_id);
            }

            UserRepo.getUsersById(ids)
            .then(hosts => {
                data.hosts = anonymizeProfiles(hosts);
                return resolve(data);
            });

        }).catch(err => {
            console.log(err);
            return reject(err);
        });
    });
};

exports.loadUserEvents = function(user, all){

    return new Promise((resolve, reject) => {
        EventRepo.findByUser(user._id, all)
        .then(events => {
            return resolve(events);
        }).catch(err => {
            console.log(err);
            return reject(err);
        });
    });
}


// SET

exports.updateUserPicture = function(user, upload, options) {
    return new Promise((resolve, reject) => {
        Files.save(upload.file);

        FileRepo.createOne(upload.file.light())
        .then(file => {
            UserRepo.updateUserPicture(file, user, options)
            .then(_user => {
                return resolve(_user);
            });
        });
    });
};

exports.updateMainPicture = function(user, mainId) {
    return new Promise((resolve, reject) => {
        UserRepo.updateMainPicture(mainId, user)
        .then(_user => {
            return resolve(_user);
        });
    });
};

exports.deleteFiles = function(user, filesId) {
    return new Promise((resolve, reject) => {

        FileRepo.removeFiles(filesId, user)
        .then(results => {
            return resolve(results);
        }).catch(err => {
            console.log(err);
            return reject(err);
        });
    });
};

exports.updateSearchParams = function(user, data) {

    let searchParams = {
        distance    : data.distance,
        age_min     : data.age_min,
        age_max     : data.age_max,
        rate_min    : data.rate_min,
        rate_max    : data.rate_max
    }

    return new Promise((resolve, reject) => {
        SearchParamsRepo.updateOneWithUser(searchParams, user)
        .then(_sp => {
            return resolve(_sp);
        }).catch(err => {
            console.log(err);
            return reject(err);
        });
    });

};

exports.mergeMatchRelation = function(user, data) {

    return new Promise((resolve, reject) => {
        MatchRepo.mergeMatch(user, data.partner_id)
        .then(match => {
            UserRepo.getUpdatedPartner(user, data.partner_id)
            .then(partner => {
                return resolve(anonymizeProfiles(partner));
            });
        }).catch(err => {
            console.log(err);
            return reject(err);
        });
    });
}

exports.addVisit = function(user, data) {

    return new Promise((resolve, reject) => {
        VisitRepo.add(user._id, data.partner_id)
        .then(visit => {
            EventRepo.add(user._id, data.partner_id, 2)
            .then(event => {
                return resolve({
                    visit   : visit,
                    event   : event
                });
            });
        }).catch(err => {
            console.log(err);
            return reject(err);
        });
    });
}

exports.updateLike = function(user, data) {

    return new Promise((resolve, reject) => {
        MatchRepo.likeMatch(user, data.partner_id, data.like)
        .then(match => {
            UserRepo.getUpdatedPartner(user, data.partner_id)
            .then(partner => {
                let eventType = data.like? 1 : 4;
                if (match.u_has_liked && match.p_has_liked){
                    eventType = 3;
                }
                EventRepo.add(user._id, data.partner_id, eventType)
                .then(p_event => {
                    if (eventType === 3){
                        EventRepo.add(data.partner_id, user._id, eventType)
                        .then(u_event => {
                            return resolve({
                                partner : anonymizeProfiles(partner),
                                p_event : p_event,
                                u_event : u_event
                            });
                        });
                    } else {
                        return resolve({
                            partner : anonymizeProfiles(partner),
                            p_event : p_event
                        });
                    }
                });
            });
        }).catch(err => {
            console.log(err);
            return reject(err);
        });
    });
};

exports.blockMatchRelation = function(user, data) {

    return new Promise((resolve, reject) => {
        MatchRepo.blockMatch(user, data.partner_id)
        .then(match => {
            if (match.u_has_liked && match.p_has_liked){
                EventRepo.add(user._id, data.partner_id, 4)
                .then(event => {
                    return resolve({
                        match   : match,
                        event   : event
                    });
                });
            } else {
                return resolve({match : match});
            }

        }).catch(err => {
            console.log(err);
            return reject(err);
        });
    });
};

exports.reportMatchRelation = function(user, data) {

    return new Promise((resolve, reject) => {
        MatchRepo.reportMatch(user, data.partner_id)
        .then(match => {
            if (match.u_has_liked && match.p_has_liked){
                EventRepo.add(user._id, data.partner_id, 4)
                .then(event => {
                    return resolve({
                        match   : match,
                        event   : event
                    });
                });
            } else {
                return resolve({match : match});
            }

        }).catch(err => {
            console.log(err);
            return reject(err);
        });
    });
};

exports.setOnlineUser = function(user) {

    return new Promise((resolve, reject) => {
        UserRepo.online(user)
        .then(user => {
            return resolve(user);
        }).catch(err => {
            console.log(err);
            return reject(err);
        });
    });
};

exports.setOfflineUser = function(user) {

    return new Promise((resolve, reject) => {
        var d = new Date();
        let datetime = Time.toDatetime(d, true);

        UserRepo.offline(user, datetime)
        .then(user => {
            return resolve(user);
        }).catch(err => {
            console.log(err);
            return reject(err);
        });
    });
};

exports.userEventsRead = function(user, all){

    return new Promise((resolve, reject) => {
        EventRepo.setReadEventsByUser(user._id, all)
        .then(events => {
            return resolve(events);
        }).catch(err => {
            console.log(err);
            return reject(err);
        });
    });
}