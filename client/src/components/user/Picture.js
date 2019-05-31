import React from 'react';
import { Button } from "react-bootstrap";

import { Component } from '../Component';
import { Loader } from '../loader/Loader';
import { Dropzone, FileContainer, FileInput } from '../images/Dropzone';

import alert from '../../utils/alert';
import utils from '../../utils/utils';
import trans from '../../translations/translate';
import filesManager from '../../utils/files';

const maxPics = 5;

export class Picture extends Component {

    constructor(props) {
        super(props);

        let user = utils.getLocalUser();

        this.state = {
            user        : user,
            files       : this.getDefaultFiles(user),
            uploading   : 0
        };

        this.socket = props._g.socket;

        this.handleSubmit.bind(this);

    }

    componentDidMount() {
        this._isMounted = true;

        let _this = this;

        this.socket.off('PP_UPDATE_CONFIRM').on('PP_UPDATE_CONFIRM', function(data){
            _this.updateProfilePicture(data.user);
        });

        this.socket.off('OP_UPLOAD_CONFIRM').on('OP_UPLOAD_CONFIRM', function(data){
            _this.otherPicturesUpload();
        });

        this.socket.off('USER_OP_CONFIRM').on('USER_OP_CONFIRM', function(data){
            _this.confirmUpdate();
        });
    }

    getDefaultFiles(user) {
        let max = maxPics - 1;
        let pictures = user.pictures;
        let files = {};

        for (let i=0; i < max; i++){
            let id = 'other' + i;
            if (pictures[i]){
                files[id] = pictures[i];
            }
        }

        return files;
    }

    handleSubmit = event => {

        let length = 0;
        let files = this.state.files;
        let data = {};
        let oldFiles = this.getDefaultFiles(this.state.user);
        let toDelete = [];

        let params = {
            file_case   : 'profile_picture'
        }

        if (files['main-picture'] && !files['main-picture']._id){
            let file = files['main-picture'];
            file.status = 'profile_picture';
            data[file.id] = file;
            length++;
        }

        let max = maxPics - 1;
        for (let i=0; i < max; i++){
            let id = 'other' + i;
            if (files[id] && !files[id]._id){
                let file = files[id];
                file.status = 'other_picture';
                data[file.id] = file;
                length++;
            } else if (files[id] === null && oldFiles[id]){
                toDelete.push(oldFiles[id]._id);
            }
        }

        if (!length && !toDelete.length){
            let title = trans.get('ERROR.TITLE');
            let msg = trans.get('ERROR.INVALID_PARAMETERS');
            alert.show({title: title, message: msg, type: 'error'});
            return;
        }

        this.setState({
            uploading   : length
        });

        filesManager.setSocket(this.socket);

        if (length){
            filesManager.sendFiles(data, params);
        } if (toDelete.length){
            filesManager.deleteFiles(toDelete);
        }
    }

    confirmUpdate(user) {
        if (user){
            utils.setLocalUser(user);
        }

        if (this.state.uploading){
            return;
        }

        let title = trans.get('SUCCESS.TITLE');
        let msg = trans.get('SUCCESS.PICTURE_SAVED');
        alert.show({title: title, message: msg, type: 'success'});
    }

    updateProfilePicture(user) {
        let uploading = this.state.uploading - 1;

        this.setState({uploading : uploading});

        this.confirmUpdate(user);
    }

    otherPicturesUpload() {
        let ids = this.getFilesId();
        let uploading = this.state.uploading - 1;

        this.setState({uploading : uploading});

        if (uploading){
            return;
        }

        let data = {
            files_id: ids
        }

        this.socket.emit('USER_OTHER_PICTURES', data);
    }

    getFilesId() {
        let ids = [];
        let files = this.state.files;

        for (let i in files){
            ids.push(files[i].id);
        }

        return ids;
    }

    updateOneFile(file, id) {
        let files = this.state.files;

        if (file){
            files[id] = file;
        } else {
            files[id] = null;
        }

        this.setState({files : files});
    }

    buildOtherPictures() {
        let max = maxPics - 1;
        let pictures = this.state.user.pictures;
        let others = [];

        for (let i=0; i < max; i++){
            let id = 'other' + i;
            let file = pictures[i]? pictures[i] : null;
            others.push(
                <ProfilePicture
                    id={ id }
                    key={ i }
                    file={ file }
                    updateFile={ (file) => this.updateOneFile(file, id) }
                />
            );
        }

        return others;
    }

    loading(){

        if (this.state.uploading > 0){
            return (
                <div className="picture-uploading">
                    <Loader />
                </div>
            );
        }

        return;
    }

    render() {

        let id = "main-picture";

        return(

            <div id="picture" className="account-block" >
                { this.loading() }
                <h2 className="form-section">{ trans.get('USER.FIELDS.PROFILE_PIC') }</h2>

                <ProfilePicture
                    id={ id }
                    file={ this.state.user.profile_pic }
                    updateFile={ (file) => this.updateOneFile(file, id) }
                />

                <div className="other-pictures">
                    { this.buildOtherPictures() }
                </div>

                <Button
                    onClick={ this.handleSubmit }
                    block
                    bsStyle="primary"
                    bsSize="large"
                >
                    { trans.get('BUTTON.SAVE') }
                </Button>
            </div>
        );
    }
}

class ProfilePicture extends Component {

    constructor(props) {
        super(props);

        this.state = {
            files   : props.file? [props.file] : []
        };

        this.handleAttach.bind(this);
    }

    handleAttach = event => {
        this.attach_input.triggerClick();
    }

    addFile(file) {
        if (!file.id){
            file.id = (new Date()).getTime();
        }

        if (this.props.updateFile){
            this.props.updateFile(file);
        }

        this.setState({files : [file]});
    }

    removeFile() {

        if (this.props.updateFile){
            this.props.updateFile(null);
        }

        this.setState({files : []});
    }

    buildFileContainer() {

        if (this.state.files.length === 1){
            return(
                <FileContainer
                    files={ this.state.files }
                    removeFile={ (fileId) => this.removeFile() }
                />
            );
        }

        return (
            <i
                className="fas fa-plus-circle fa-3x"
                onClick={ this.handleAttach }
            >
                <FileInput
                    className="attach-files"
                    files={ this.state.files }
                    addFile={ (file) => this.addFile(file) }
                    ref={ el => this.attach_input = el }
                    imgOnly
                />
            </i>
        );
    }

    render() {
        return (
            <Dropzone
                id={ this.props.id }
                className="one-profile-picture"
                files={ this.state.files }
                addFile={ (file) => this.addFile(file) }
                maxFiles={ 1 }
                imgOnly
                replace
            >
                { this.buildFileContainer() }
            </Dropzone>
        );
    }


}