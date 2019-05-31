const yaml = require("node-yaml");

function customObjectAssign(a, b){

    let data = {};
    if (!a || !b || typeof a !== 'object' || typeof b !== 'object'){
        return data;
    }

    return customObjectParser(a, b);
}

function customObjectParser(a, b){

    a = a || {};
    let data = a;

    for (var i in b){
        if (b[i] && typeof b[i] === 'object'){
            data[i] = customObjectParser(a[i], b[i]);
        } else if (a && a[i]){
            data[i] = a[i];
        } else {
            data[i] = '';
        }
    }

    return data;
}

exports.supported = ['en', 'fr'];

exports.getFile = function(language) {

    if (!language || this.supported.indexOf(language) === -1){
        console.warn(`Language (${language}) is not supported/defined.`);
        return null;
    }

    let fileName = `./translations.${language}.yml`;
    let content = yaml.readSync(fileName)
    return content;
};

exports.setFile = function(data, language){

    if (!language || this.supported.indexOf(language) === -1){
        console.warn(`Language (${language}) is not supported/defined.`);
        return null;
    }

    let fileName = `./translations.${language}.yml`;
    yaml.write(fileName, data);
};

exports.upgradeFiles = function(){

    let files = {};

    for (var i in this.supported){
        let language = this.supported[i];

        files[language] = this.getFile(language);
    }

    let generic = {};
    for (j in files){
        generic = customObjectAssign(generic, files[j]);
    }

    for (k in files){
        files[k] = customObjectAssign(files[k], generic);
        this.setFile(files[k], k);
    }
}

exports.parsePath = function(path) {
    if (typeof path === 'string'){
        path = path.split('.');
    }

    return path;
};

exports.setLanguage = function(language){
    this.language = language;
};

exports.get = function(path, params, language) {
    language = language || this.language;
    const file = this.getFile(language);
    path = this.parsePath(path);

    if (!file){
        return path.join('.');
    }

    let msg = file;
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
};
