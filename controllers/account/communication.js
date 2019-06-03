const mailer = require('../communication/mailer.js');
const config = require('../../config/config');


function sendMail(params){
    return mailer.send(params);
}

exports.resetPassword = {

    send        : function(user){

        let params = {
            to      : user.email,
            subject : 'MAIL.SUBJECT.RESET',
            template: 'resetPassword.ejs',
            data    : {
                user    : user,
                config  : config
            }
        };

        return sendMail(params)
        .then(function(){
        }).catch(function(err){
            console.log(err);
        });
    }

};

exports.signUp = {

    send    : function(user){

        let params = {
            to      : user.email,
            subject : 'MAIL.SUBJECT.WELCOME',
            template: 'validateAccount.ejs',
            data    : {
                user    : user,
                config  : config
            }
        };
    
        return sendMail(params)
        .catch(function(err){
            console.log(err);
        });
    }

};

exports.validateEmailAddress = {

    send    : function(user){

        let params = {
            to      : user.email,
            subject : 'MAIL.SUBJECT.EMAIL',
            template: 'validateEmailAddress.ejs',
            data    : {
                user    : user,
                config  : config
            }
        };
    
        return sendMail(params)
        .catch(function(err){
            console.log(err);
        });
    }

};

exports.lockedAccount = {

    send    : function(user){

        let params = {
            to      : user.email,
            subject : 'MAIL.SUBJECT.BLOCK',
            template: 'lockedAccount.ejs',
            data    : {
                user    : user,
                config  : config
            }
        };
    
        return sendMail(params)
        .catch(function(err){
            console.log(err);
        });
    }

};