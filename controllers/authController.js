const passport = require('passport');

module.exports = function (app) {

    // PASSPORT INIT
    passport.serializeUser(function(user, done) {
        done(null, user);
    });
    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });
    app.use(passport.initialize());

    app.use(function (req, res, next) {
        if (req.query.locale){
            app.data = {
                locale  : req.query.locale
            }
        }
        next();
    });

    // GOOGLE
    app.use('/google', app);
    require(__dirname + '/passport/google')(app);

}