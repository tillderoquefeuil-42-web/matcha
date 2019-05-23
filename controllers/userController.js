const account = require('./account/lib.js');

module.exports = function (app) {

    // POST

    app.post('/auth', account.auth);

    app.post('/signIn', account.signIn);
    app.post('/checkUsernames', account.checkUsernames);

    app.post('/signUp', account.signUp);

    app.post('/resetPassword', account.resetPassword);
    app.post('/savePswdByToken', account.savePswdByToken);

    app.post('/sendLockedAccount', account.sendLockedAccount);

    app.post('/saveUser', account.saveUser);
    app.post('/saveNewEmail', account.saveNewEmail);
    app.post('/saveNewPassword', account.saveNewPassword);
    app.post('/saveLocation', account.saveLocation);

    app.post('/deleteAccount', account.deleteAccount);

    app.post('/tags', account.getTags);


    // GET

    app.get('/validateAccount', account.validateAccount);
    app.get('/unlockAccount', account.unlockAccount);

}