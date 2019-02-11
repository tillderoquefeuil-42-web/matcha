
export default {

    supported   : {
        en  : 'famfamfam-flag-gb',
        fr  : 'famfamfam-flag-fr'
    },

    getLocale   : function(){
        let locale = localStorage.getItem('locale');
        return (locale || 'en');
    },

    setLocale   : function(locale, reload){
        if (this.getLocale() === locale || !locale){
            return;
        }
        
        let supported = Object.keys(this.supported)
        if (supported.indexOf(locale) === -1){
            return;
        }
        
        localStorage.setItem('locale', locale);
        if (reload){
            window.location.reload();
        }

        return;
    },

    setFile     : function(translations){
        if (translations){
            let data = {
                locale          : this.getLocale(),
                translations    : translations
            }
            localStorage.setItem('translations-file', JSON.stringify(data));
        }
    },

    getFile     : function(){
        let file = localStorage.getItem('translations-file');
        file = JSON.parse(file);

        if (file && file.locale !== this.getLocale()){
            return null;
        }

        return file;
    },

    parsePath   : function(path){
        if (typeof path === 'string'){
            path = path.split('.');
        }

        return path;
    },

    get         : function(path, params){
        const file = this.getFile();
        path = this.parsePath(path);

        if (!file){
            return path.join('.');
        }

        let translations = file.translations;

        let msg = translations;
        for (var i in path){
            if (msg[path[i]]){
                msg = msg[path[i]];
            } else {
                msg = null;
                break;
            }
        }

        if (msg && typeof msg === 'object' && msg.length > 1 && params && msg.length > 1){
            msg = (parseInt(params[Object.keys(params)[0]]) > 1? msg[1] : msg[0]);
        }


        if (msg && typeof msg === 'string' && params){
            for (var j in params){
                var r = new RegExp(`{{[ ]*${j}[ ]*}}`, 'g');
                msg = msg.replace(r, params[j]);
            }
        } else if (!msg){
            msg = path.join('.');
        }

        return msg;
    }
}
