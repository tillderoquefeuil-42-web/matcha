
const account = require('./account/lib.js');
var multer  = require('multer');
var upload = multer({ dest: 'client/public/uploads/' });

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

    app.post('/savePicture', upload.single('profile_picture'), account.savePicture);

    app.post('/get/friends', account.getFriendsByUser);
    app.post('/deleteAccount', account.deleteAccount);


    // GET

    app.get('/validateAccount', account.validateAccount);
    app.get('/unlockAccount', account.unlockAccount);

}