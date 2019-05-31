const fs = require('fs');

const FileRepo = require('../../database/repositories/File.js');

const struct = {
    id      : null,
    name    : null,
    type    : null,
    size    : 0,
    data    : [],
    slice   : 0,
    filename: '',
    date    : null,
    light   : function(){

        return {
            id      : this.id,
            type    : this.type,
            size    : this.size,
            filename: this.filename,
            date    : this.date
        }
    }
};


const __absolute = 'client/';
const __path = 'uploads/pictures/';
const __public_path = 'public/uploads/';
const __private_path = 'private/uploads/';

const fileSliceSize = 100000;
let files = {};


function removeFile(filepath){
    fs.unlink(filepath, function(error) {
        if (error) {
            throw error;
        }
    })
}

module.exports = {

    getFileStruct   : function(){
        return struct;
    },

    getFilePath   : function(){
        return __path;
    },

    init            : function(data, user){

        let file = Object.assign({}, struct, data);
        file.data = [];

        file.filename = this.generateName(file, user);
        file.link = __absolute + __private_path + file.filename;
        file.date = (new Date()).getTime();

        return file;
    },

    extractData     : function(file){
        //convert the ArrayBuffer to Buffer
        let data = new Buffer.alloc(file.data.length, new Uint8Array(file.data));
        
        return data;
    },

    pushDataSlice   : function(file, data){
        file.data.push(data);
        file.slice++;
    },

    uploaded        : function(file){
        if (file.slice * fileSliceSize >= file.size) {
            return true;
        }

        return false;
    },

    parse           : function(data, user){

        let file = files[data.id];

        if (!file){
            file = this.init(data, user);
        }

        let sliceData = this.extractData(data);
        this.pushDataSlice(file, sliceData);

        return file;
    },

    uploadFile      : function(data, user){
        let file = this.parse(data, user);
        files[file.id] = file;

        let results = {
            file    : file,
            id      : file.id,
            slice   : file.slice,
            end     : this.uploaded(file)
        };

        if (results.end){
            delete files[file.id];
        }

        return results;
    },

    generateName    : function(file, user){
        let type = file.type.split('/')[1];

        return (user? user._id + '_' : '') + file.id + '.' + type;
    },

    save            : function(file){
        let fileBuffer = Buffer.concat(file.data);

        fs.writeFile(file.link, fileBuffer, (err) => {
            if (err) throw err;
        });
        
    },

    parseFilename     : function(filename){
        let regex = new RegExp('(\.{2}\/)+', 'g');
        return filename.replace(regex, '');
    },

    getPrivateFilePath     : function(filename){
        filename = this.parseFilename(filename);
        return __absolute + __private_path + filename;
    },
    
    getPublicFilePath     : function(filename){
        filename = this.parseFilename(filename);
        return __absolute + __public_path + filename;
    },

    readFile        : function(filepath, callback){
        fs.readFile(filepath, 'utf8', callback);
    },

    saveFromUrl     : function(user, filepath, type){
        return new Promise((resolve, reject) => {
            let filedata = this.init({
                type    : type,
                id      : (new Date()).getTime() 
            }, user);

            fs.readFile(filepath, function(err, data) {
                if (err) throw err;
                fs.writeFile(filedata.link, data, (err) => {
                    if (err) throw err;
                    return resolve(filedata);
                });
            });
        });
    },

    userHasRightToSee   : function(filename, user){
        return new Promise((resolve, reject) => {

            FileRepo.userLinks(filename, user._id)
            .then(file => {
                return resolve(file);
            }).catch(err => {
                return reject(err)
            });
        });
    },

    deleteAll               : function(){
        this.deleteFolder(__absolute + __private_path);
    },

    deleteFolder            : function(path){
        fs.readdir(path, function(err, items) {
            for (let i in items){
                if (items[i] === '.gitingore'){
                    continue;
                }
                removeFile(path + items[i])
            }
        });
    }

}