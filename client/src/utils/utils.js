import trans from "../translations/translate";
import API from '../utils/API.js';

const slugify = require('slugify');

export default {

    isDefine            : function(variable){
        if (typeof variable === 'undefined'){
            return false;
        }
        return true;
    },

    slugify             : function(txt, separator){

        separator = this.isDefine(separator)? separator : '.';
        return slugify(txt, separator).toLowerCase();
    },

    pswdStrength        : function(pswd){

        if (pswd.length < 8){
            return false;
        }

        const regex = {
            upper   : /[A-Z]/g,
            lower   : /[a-z]/g,
            numeric : /[0-9]/g,
            special : /[!@#$%^&*(),.?":{}|<>]/g
        };

        for (let i in regex){
            let matches = pswd.match(regex[i]);
            if (!matches){
                return false;
            }
        }

        return true;
    },

    getQueryParameters  : function(props){
        let search = {};

        if (props.location){
            search = props.location.search;
        }

        return new URLSearchParams(search);
    },

    generatePageTitle   : function(name){
        let title = trans.get('GLOBAL.NAME');

        if (!name){
            return title
        }

        return title + " | " + name;
    },

    setLocalUser        : function(user){

        if (user && !(parseInt(user._id) >= 0)){
            console.warn("CAN'T UPDATE : User returned has no ID");
            return;
        }

        let _user = this.getLocalUser();
        if (!user || JSON.stringify(user) === JSON.stringify(_user)){
            return null;
        }

        user.last_update = (new Date()).getTime();

        localStorage.setItem('user', JSON.stringify(user));

        var event = new Event('maj_display');
        document.dispatchEvent(event);

        return user;
    },

    getLocalUser        : function(){

        let user = JSON.parse(localStorage.getItem('user'));
        
        if (user && user.last_update){
            let date = (new Date()).getTime();
            if (user.last_update > date - 300000){
                return user;
            }

            let user_request = localStorage.getItem('user_request');
            if (!user_request){
                localStorage.setItem('user_request', 1);
                let _this = this;
                console.log('user to update');
                
                API.isAuth()
                .then(function(data){
                    let user = data.data.user;
                    _this.setLocalUser(user);
                    trans.setLocale(user.language, true);
                    localStorage.setItem('user_request', 0);
                    console.log('user updated');
                }, function(error){
                    console.warn(error);
                });
            }

            return user;
        }

        return null;
    },

    setFooterChats      : function(partnersId){
        localStorage.setItem('footer_chats', JSON.stringify(partnersId));
    },

    getFooterChats      : function(){
        let partnersId = localStorage.getItem('footer_chats');

        if (partnersId){
            return JSON.parse(partnersId);
        }

        return [];
    },

    indexCollection     : function(c, index){

        index = index || '_id';

        let collection = {};

        for (let i in c){
            let item = c[i];
            let id = item[index];
            collection[id] = item;
        }

        return collection;
    },

    linkifyRegexp       : function(){

        var regex = "((?:(http|https|Http|Https|rtsp|Rtsp):\\/\\/(?:(?:[a-zA-Z0-9\\$\\-\\_\\.\\+\\!\\*\\'\\(\\)"
        + "\\,\\;\\?\\&\\=]|(?:\\%[a-fA-F0-9]{2})){1,64}(?:\\:(?:[a-zA-Z0-9\\$\\-\\_"
        + "\\.\\+\\!\\*\\'\\(\\)\\,\\;\\?\\&\\=]|(?:\\%[a-fA-F0-9]{2})){1,25})?\\@)?)?"
        + "((?:(?:[a-zA-Z0-9][a-zA-Z0-9\\-]{0,64}\\.)+"   // named host
        + "(?:"   // plus top level domain
        + "(?:aero|arpa|asia|a[cdefgilmnoqrstuwxz])"
        + "|(?:biz|b[abdefghijmnorstvwyz])"
        + "|(?:cat|com|coop|c[acdfghiklmnoruvxyz])"
        + "|d[ejkmoz]"
        + "|(?:edu|e[cegrstu])"
        + "|f[ijkmor]"
        + "|(?:gov|g[abdefghilmnpqrstuwy])"
        + "|h[kmnrtu]"
        + "|(?:info|int|i[delmnoqrst])"
        + "|(?:jobs|j[emop])"
        + "|k[eghimnrwyz]"
        + "|l[abcikrstuvy]"
        + "|(?:mil|mobi|museum|m[acdghklmnopqrstuvwxyz])"
        + "|(?:name|net|n[acefgilopruz])"
        + "|(?:org|om)"
        + "|(?:pro|p[aefghklmnrstwy])"
        + "|qa"
        + "|r[eouw]"
        + "|s[abcdeghijklmnortuvyz]"
        + "|(?:tel|travel|t[cdfghjklmnoprtvwz])"
        + "|u[agkmsyz]"
        + "|v[aceginu]"
        + "|w[fs]"
        + "|y[etu]"
        + "|z[amw]))"
        + "|(?:(?:25[0-5]|2[0-4]" // or ip address
        + "[0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\\.(?:25[0-5]|2[0-4][0-9]"
        + "|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\\.(?:25[0-5]|2[0-4][0-9]|[0-1]"
        + "[0-9]{2}|[1-9][0-9]|[1-9]|0)\\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}"
        + "|[1-9][0-9]|[0-9])))"
        + "(?:\\:\\d{1,5})?)" // plus option port number
        + "(\\/(?:(?:[a-zA-Z0-9\\;\\/\\?\\:\\@\\&\\=\\#\\~"  // plus option query params
        + "\\-\\.\\+\\!\\*\\'\\(\\)\\,\\_])|(?:\\%[a-fA-F0-9]{2}))*)?"
        + "(?:\\b|$)";


        return new RegExp(regex, 'gi');
    },

    addClass            : function(element, className){

        if (!element || !element.className){
            return;
        }

        let classList = element.className.split(' ');
        if (classList.indexOf(className) === -1){
            classList.push(className);
            element.className = classList.join(' ');
        }

        return element;
    },

    removeClass         : function(element, className){

        if (!element || !element.className){
            return;
        }

        let classList = element.className.split(' ');
        let index = classList.indexOf(className);
        if (index !== -1){
            classList.splice(index, 1);
            element.className = classList.join(' ');
        }

        return element;
    },

    toggleClass         : function(element, className){

        if (!element || !element.className){
            return;
        }

        let classList = element.className.split(' ');
        let index = classList.indexOf(className);
        if (index === -1){
            classList.push(className);
        } else {
            classList.splice(index, 1);
        }

        element.className = classList.join(' ');
        return element;
    },

    objectLength        : function(object){

        let length = 0;

        for (let i in object){
            if (typeof object[i] !== 'function'){
                length++;
            }
        }

        return length;
    },

    getFileUrl          : function(file) {
        let token = (localStorage.getItem('token')? localStorage.getItem('token') : "");
        let url = `http://localhost:8000/file/private?_t=${token}&filename=${file.filename}`;

        return url;
    }

}