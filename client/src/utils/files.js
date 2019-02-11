import utils from './utils';

const fileSliceSize = 100000;


export default {

    socket      : null,

    setSocket   : function(socket){
        this.socket = socket;
    },

    sendOneFile : function(file, params){
        let fileReader = new FileReader();
        let slice = file.slice(0, fileSliceSize);
        let _this = this;

        fileReader.onload = (evt) => {
            let arrayBuffer = fileReader.result;

            let data = Object.assign({
                id      : file.id,
                name    : file.name,
                type    : file.type,
                size    : file.size,
                data    : arrayBuffer
            }, params);

            _this.socket.emit('FILE_SLICE_UPLOAD', data);
        }

        fileReader.readAsArrayBuffer(slice);
        return fileReader;
    },

    sendFiles       : function(files, params){

        for (let i in files){
            if (!files[i].id){
                files[i].id = (new Date()).getTime();
            }
        }

        files = utils.indexCollection(files, 'id');

        let fileReaders = {};

        this.socket.off('UPLOAD_NEXT_SLICE').on('UPLOAD_NEXT_SLICE', (data) => {
            let file = files[data.id];
            let place = data.slice * fileSliceSize;
            let slice = file.slice(place, place + Math.min(fileSliceSize, file.size - place));

            fileReaders[data.id].readAsArrayBuffer(slice);
        });

        for (let i in files){
            let file = files[i];
            fileReaders[file.id] = this.sendOneFile(file, params);
        }
    }

}