module.exports = {

    secret      : "tokenGeneration",

    params      : {
        MAX_SIGN_IN_TRY : 3,
        MIN_AGED_USERS  : 16
    },

    server      : {
        hostname        : "localhost",
        port            : 8000
    },
    
    client      : {
        hostname        : "localhost",
        port            : 3000
    },
    
    database    : {
        hostname        : "localhost",
        username        : "neo4j",
        password        : "6c_dB01AEc68B71o",
        port            : 7687
    },
    
    mailer      : {
        service         : "gmail",
        email           : "tillderoquefeuil@gmail.com",
        password        : "gpwouedafxqbyuev",
        host            : 'smtp.gmail.com',
        port            : 465,
        from            : "tillderoquefeuil@gmail.com"
    },

    GOOGLE      : {
        CLIENT_ID       : "945967528346-7t5a7i5ainhv0v7gudd9oc6bl48safsi.apps.googleusercontent.com",
        CLIENT_SECRET   : "UQkvHxkdENvkJOVbbptXYCw1",
        CALLBACK        : "auth/google/callback"
    }

}