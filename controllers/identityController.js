const account = require('./account/lib.js');

module.exports = function (app) {

    app.use((req, res, next) => {

        let token = req.body.token || req.body._token || req.query._token;

        account.getUserFromToken(token)
        .then(user => {
            if (user){
                req.user = user;
            }
            return next();
        }).catch(err => {
            return next();
        });
    });

}
