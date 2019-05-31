const mailer = require('../communication/mailer.js');
const config = require('../../config/config');


function sendMail(params){
    return mailer.send(params);
}

exports.resetPassword = {

    
    send        : function(user){

        let params = {
            to      : user.email,
            subject : 'Please verify that it’s you',
            template: 'resetPassword.ejs',
            data    : {
                user    : user,
                config  : config
            }
        };

        return sendMail(params)
        .then(function(){
            console.log('MAIL_SENT');
        })
        .catch(function(err){
            console.log('MAIL_ERROR');
            console.log(err);
        });
    }

};

exports.signUp = {

    send    : function(user){

        let params = {
            to      : user.email,
            subject : 'Welcome in!',
            template: 'validateAccount.ejs',
            data    : {
                user    : user,
                config  : config
            }
        };
    
        return sendMail(params)
        .then(function(){
            console.log('MAIL_SENT');
        })
        .catch(function(err){
            console.log('MAIL_ERROR');
            console.log(err);
        });
    }

};

exports.validateEmailAddress = {

    send    : function(user){

        let params = {
            to      : user.email,
            subject : 'New email address',
            template: 'validateEmailAddress.ejs',
            data    : {
                user    : user,
                config  : config
            }
        };
    
        return sendMail(params)
        .then(function(){
            console.log('MAIL_SENT');
        })
        .catch(function(err){
            console.log('MAIL_ERROR');
            console.log(err);
        });
    }

};

exports.lockedAccount = {

    send    : function(user){

        let params = {
            to      : user.email,
            subject : 'Someone tried to sign in on your account',
            template: 'lockedAccount.ejs',
            data    : {
                user    : user,
                config  : config
            }
        };
    
        return sendMail(params)
        .then(function(){
            console.log('MAIL_SENT');
        })
        .catch(function(err){
            console.log('MAIL_ERROR');
            console.log(err);
        });
    }

};