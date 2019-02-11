const ConvRepo = require('../../database/repositories/Conversation.js');
const MsgRepo = require('../../database/repositories/Message.js');
const FriendshipRepo = require('../../database/repositories/Friendship.js');
const FileRepo = require('../../database/repositories/File.js');

const Files = require('../utils/files.js');
const files = {};


// ***** HELPERS ***** //

function parseLastMessageByConvs(conversations, messages) {
    let convs = {};
    for (let i in conversations){
        convs[conversations[i]._id] = conversations[i];
    }

    for (let j in messages){
        let message = messages[j];
        let conv = convs[message.conv_id];
        if (conv){
            conv.last_message = message;
        }
    }

    return convs;
}


// ***** GET DATA ***** //

exports.loadConversations = function(userId) {

    let data = {
        conversations   : [],
        error           : null
    };

    return new Promise((resolve, reject) => {

        if (!(userId >= 0)){
            data.error = "INVALID_PARAMETERS";
            return reject(data);
        }

        ConvRepo.findAllByUser(userId)
        .then(convs => {
            if (convs && convs.length > 0){
                MsgRepo.findLastMessageByConversations(convs)
                .then(messages => {
                    data.conversations = parseLastMessageByConvs(convs, messages);
                    return resolve(data);
                }, function(err){
                    data.error = "INTERNAL_ERROR";
                    return reject(data);
                });
            } else {
                return resolve(data);
            }
        });
    });
};

exports.loadMessages = function(convId, skip) {

    let data = {
        messages    : [],
        error       : null
    };

    return new Promise((resolve, reject) => {

        if (!(convId >= 0)){
            data.error = "INVALID_PARAMETERS";
            return reject(data);
        }

        FriendshipRepo.findOneByConv(convId)
        .then(friendship => {
            if (friendship && friendship.locked){
                return resolve({ERROR:'friendship has been locked'});
            }

            MsgRepo.findByConversation(convId, 50, skip)
            .then(messages => {
                data.messages = messages;
                return resolve(data);
            });
        }, function(err){
            console.log(err);
            data.error = "INTERNAL_ERROR";
            return reject(data);
        });
    });
};

exports.loadOneConversation = function(convId, userId) {
    let data = {};

    return new Promise((resolve, reject) => {
        FriendshipRepo.findOneByConv(convId)
        .then(friendship => {
            if (friendship && friendship.locked){
                return resolve({ERROR:'friendship has been locked'});
            }

            ConvRepo.findOneById(convId, userId)
            .then(conv => {
                MsgRepo.findLastMessageByConversations([conv])
                .then(messages => {
                    let convs = parseLastMessageByConvs([conv], messages);
                    data.conv = convs[conv._id]? convs[conv._id] : null;
                    return resolve(data);
                });
            });
        }).catch(err => {
            console.log(err);
            return reject(err);
        });
    });
};

exports.loadOneConversationByUsers = function(usersId) {

    let data = {};

    return new Promise((resolve, reject) => {
        FriendshipRepo.findOrCreate(usersId[0], usersId[1])
        .then(friendship => {
            if (friendship.locked){
                return resolve({ERROR:'friendship has been locked'});
            }
            ConvRepo.findOrCreate(usersId)
            .then(conv => {
                if (conv){
                    MsgRepo.findByConversation(conv, 50)
                    .then(messages => {
                        let convs = parseLastMessageByConvs([conv], messages);
                        data.conv = convs[conv._id]? convs[conv._id] : null;
                        return resolve(data);
                    });
                } else {
                    return reject(404);
                }
            });
        }).catch(err => {
            console.log(err);
            return reject(err);
        });
    });
}

exports.getUnreadConversations = function(userId) {
    return ConvRepo.getUnreadConvs(userId)
};


// ***** SET DATA ***** //

exports.fillConvMessage = function(usersId, count) {

    count = count || 0;

    return new Promise((resolve, reject) => {
        ConvRepo.findOrCreate(usersId)
        .then(conv => {
            let convId = conv._id;
            MsgRepo.createOne('Is this a test message?', usersId[0], convId)
            .then(results => {
                MsgRepo.createOne('Well yeah, I think so!', usersId[1], convId)
                .then(results => {
                    if (count < 50){
                        this.fillConvMessage(usersId, count + 1)
                        .then(results => {
                            return resolve(results);
                        });
                    } else {
                        return resolve(results);
                    }
                });
            });
        }).catch(err => {
            return reject(err);
        });
    });
};

exports.createOneMessage = function(data, user) {

    return new Promise((resolve, reject) => {
        ConvRepo.setUnreadConv(data.conv_id, user._id)
        .then(result => {
            MsgRepo.createOne(data.msg_value, user._id, data.conv_id, data.files_id)
            .then(results => {
                return resolve(results);
            });
        }).catch(err => {
            return reject(err);
        });
    });
};

exports.uploadFile = function(convId, upload, user) {

    return new Promise((resolve, reject) => {

        Files.save(upload.file);
        this.linkMessageAndFile(upload.file, convId)
        .then(message => {
            upload.message = message;
            return resolve(upload);
        });

    });
};

exports.linkMessageAndFile = function(file, convId) {

    return new Promise((resolve, reject) => {
        FileRepo.createOne(file.light())
        .then(_file => {
            MsgRepo.updateOneMessageFiles(_file, convId)
            .then(results => {
                let files = Object.values(results.files);
                if (files.length > 0){
                    results.file = files[0];
                }

                return resolve(results);
            });
        }).catch(err => {
            return reject(err);
        });
    });
};

exports.updateOneConversation = function(convId, userId) {

    return new Promise((resolve, reject) => {

        ConvRepo.setReadConv(convId, userId)
        .then(result => {
            this.loadOneConversation(convId, userId)
            .then(data => {
                return resolve(data);
            });
        }).catch(err => {
            console.log(err);
            return reject(err);
        });
    });
};
