const nodemailer = require('nodemailer');
const ejs = require('ejs');

const config = require('../../config/config');
const translate = require('../../translations/translate');

let mailer = {};

mailer.transporter = nodemailer.createTransport({
    host: config.mailer.host,
    port: config.mailer.port,
    secure: true, // use SSL
    service   : config.mailer.service,
    auth      : {
        user    : config.mailer.email,
        pass    : config.mailer.password
    }
});

mailer.send = function(params){
    let _this = this;

    if (params.template){
        return new Promise((resolve, reject) => {
            if (params.data.user){
                translate.setLanguage(params.data.user.language);
            }
            params.data.trans = translate;

            _this.renderFile(params, function(err, html){
                if (err){
                    return reject(err);
                }
    
                params.html = html;
                return resolve(_this.sendOneMail(params));
            });
        });
    }

    return this.sendOneMail(params);
}

mailer.renderFile = function(params, callback){
    return ejs.renderFile('views/mails/' + params.template, params.data, callback);
}


mailer.sendOneMail = function(params){
    return new Promise((resolve, reject) => {
        if (!params || !params.to || !params.subject || !(params.text || params.html)){
            return reject("INVALID MAIL PARAMETERS");
        }

        if (!params.from){
            params.from = config.mailer.from;
        }

        mailer.transporter.sendMail(params, function(error, info){
            if (error) {
                return reject(error);
            } else {
                return resolve(info);
            }
        });
    });
};

module.exports = mailer;