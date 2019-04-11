const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const account = require('../account/lib.js');
const config = require('../../config/config');

module.exports = function (app) {

    // CONFIGURATION

    let googleCallback = "http://" + config.server.hostname + ":" + config.server.port + "/" + config.GOOGLE.CALLBACK;

    passport.use(
        new GoogleStrategy({
            clientID: config.GOOGLE.CLIENT_ID,
            clientSecret: config.GOOGLE.CLIENT_SECRET,
            callbackURL: googleCallback
        },
        function(accessToken, refreshToken, profile, done) {

            if (!profile.emails || !profile.emails.length){
                return done('NO_USER_MAIL', mull);
            }

            let email = profile.emails[0].value;

            let user = {
                providers   : ['google'],
                valid       : true,
                firstname   : profile.name.givenName,
                lastname    : profile.name.familyName,
                email       : email,
                username    : email,
                googleId    : profile.id,
                see_m       : true,
                see_f       : true,
                see_nb      : true
            }

            if (app.data && app.data.locale){
                user.language = app.data.locale;
            }

            return account.findOrCreate(user, function (err, _user) {
                return done(err, _user);
            });
        }
    ));


    // CALL
    app.get(
        '/google', 
        passport.authenticate(
            'google',
            { scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email'
            ]}
        )
    );

    // CALLBACK
    app.get(
        '/google/callback', 
        passport.authenticate(
            'google', 
            { failureRedirect: `http://${config.client.hostname}:${config.client.port}/error` }
        ),
        function(req, res) {
            let token = req.user.getToken();

            let link = `http://${config.client.hostname}:${config.client.port}/?token=${token}`;
            res.redirect(link);

            return;
        }
    );


}