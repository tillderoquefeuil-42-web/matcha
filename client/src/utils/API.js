
import axios from 'axios';

const headers = {
    'Content-Type': 'application/json'
}
const burl = "http://localhost:8000"

export default {

    post                : function(url, params, header) {

        params = params || {};
        
        let tokenData = {
            name    : '_token',
            token   : (localStorage.getItem('token')? localStorage.getItem('token') : "")
        }

        if (params instanceof FormData){
            params.append(tokenData.name, tokenData.token);
        } else {
            params[tokenData.name] = tokenData.token;
        }

        return axios.post(burl + url, params, {headers: header||headers});
    },

    redirection         : function(params){
        if (params.redirect){
            window.location = params.redirect;
            return true;
        }

        return false;
    },


    // TRANSLATIONS

    getTranslations     : function(language){
        return this.post('/translations', {language : language});
    },

    // TAGS

    getTags             : function(){
        return this.post('/user/tags');
    },


    // USER MANAGEMENT

    signIn              : function(username, password) {
        return this.post('/user/signIn', {
            username    : username,
            password    : password
        });
    },

    checkUsernames      : function(usernames, userId) {
        return this.post('/user/checkUsernames', {
            usernames   : usernames,
            user_id     : userId
        });
    },

    signUp              : function(send){
        return this.post('/user/signUp', send);
    },

    signOut             : function() {
        localStorage.clear();
    },

    isAuth              : function() {
        return this.post('/user/auth');
    },

    resetPassword       : function(email){
        return this.post('/user/resetPassword', {
            email   : email
        });
    },
    
    savePswdByToken     : function(token, password){
        return this.post('/user/savePswdByToken', {
            token   : token,
            password: password
        });
    },
    
    sendLockedAccount   : function(email){
        return this.post('/user/sendLockedAccount', {
            email   : email
        });
    },
    
    saveUserData        : function(user){
        return this.post('/user/saveUser', {
            user    : user
        });
    },

    saveNewEmail        : function(email, password){
        return this.post('/user/saveNewEmail', {
            email   : email,
            password: password
        });
    },

    saveNewPassword     : function(oldPassword, password){
        return this.post('/user/saveNewPassword', {
            old_password: oldPassword,
            password    : password
        });
    },

    deleteAccount       : function(){
        return this.post('/user/deleteAccount');
    }

}