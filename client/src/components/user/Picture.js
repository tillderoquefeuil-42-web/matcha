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
            mainId      : this.getDefaultMainId(user),
            uploading   : 0
        };

        this.socket = props._g.socket;

        this.handleSubmit.bind(this);

    }

    componentDidMount() {
        this._isMounted = true;

        let _this = this;

        this.socket.off('USER_PICTURE_UPDATE').on('USER_PICTURE_UPDATE', function(data){
            _this.updateUserPicture(data.user);
        });

        this.socket.off('END_USER_PICTURE_UPDATE').on('END_USER_PICTURE_UPDATE', function(data){
            _this.updateUserPicture(data.user, true);
        });

        this.socket.off('USER_DELETE_FILES').on('USER_DELETE_FILES', function(data){
            _this.confirmDelete();
        });
    }

    getDefaultFiles(user) {
        let max = maxPics;
        let pictures = user.pictures;
        let files = {};

        let tmp = utils.indexCollection(pictures, 'place');

        for (let i=0; i < max; i++){
            let id = 'picture_' + i;
            if (tmp[id]){
                files[id] = tmp[id];
            }
        }

        return files;
    }

    getDefaultMainId(user) {
        let pictures = user.pictures;

        for (let i in pictures){
            if (pictures[i] && pictures[i].main){
                return pictures[i].id;
            }
        }

        return null;
    }

    confirmDelete(){
        let title = trans.get('SUCCESS.TITLE');
        let msg = trans.get('SUCCESS.PICTURES_DELETED');
        alert.show({title: title, message: msg, type: 'success'});
    }

    updateUserPicture(user, end) {
        if (this.state.uploading > 0){
            this.setState({uploading : this.state.uploading - 1});
        }

        if (user){
            utils.setLocalUser(user);
            this.setState({
                user    : user,
                files   : this.getDefaultFiles(user)
            });
        }

        if (this.state.uploading){
            return;
        }

        this.confirmUpdate(end);
    }

    confirmUpdate(end) {

        if (!end){
            this.socket.emit('UPDATE_MAIN_PICTURE', {main_id:this.state.mainId});
        } else {
            let title = trans.get('SUCCESS.TITLE');
            let msg = trans.get('SUCCESS.PICTURE_SAVED');
            alert.show({title: title, message: msg, type: 'success'});
        }
    }

    handleSubmit = event => {

        let files = this.state.files;

        let data = {
            to_update   : this.getUpdateFiles(files),
            to_delete   : this.getDeleteFiles(files),
            main_id     : this.mainIdChanged()
        };

        let params = {file_case : 'user_pictures'};

        if (!data.to_update.length && !data.to_delete.length){
            if (data.main_id){
                this.confirmUpdate();
            }
            return;
        }

        this.setState({uploading : data.to_update.length});

        filesManager.setSocket(this.socket);

        if (data.to_update.length){
            filesManager.sendFiles(data.to_update, params);
        } if (data.to_delete.length){
            filesManager.deleteFiles(data.to_delete);
        }
    }

    getUpdateFiles(files){
        let toUpdate = [];

        for (let i=0; i<maxPics; i++){
            let id = 'picture_' + i;
            let file = files[id];

            if (file && !file._id){
                toUpdate.push(file);
            }
        }

        return toUpdate;
    }

    getDeleteFiles(files){
        let oldFiles = this.getDefaultFiles(this.state.user);
        let toDelete = [];

        for (let i=0; i<maxPics; i++){
            let id = 'picture_' + i;

            if (files[id] === null && oldFiles[id]){
                toDelete.push(oldFiles[id]._id);
            }
        }

        return toDelete;
    }

    mainIdChanged() {
        let user = this.state.user;

        let oldId = this.getDefaultMainId(user);

        return (oldId === this.state.mainId? false : true);
    }

    updateOneFile(file, id) {
        let files = this.state.files;

        if (file){
            files[id] = file;
        } else {
            files[id] = null;
        }

        this.parseMainPicture(files);

        this.setState({files : files});
    }

    setMainPicture(fileId) {
        this.setState({mainId:fileId});
    }

    parseMainPicture(files){

        let mainId = this.state.mainId;

        let tmp = utils.indexCollection(files, 'id');

        if (!tmp[mainId]){
            for (let i in files){
                if (files[i] && files[i].id){
                    this.setMainPicture(files[i].id);
                    break;
                }
            }
        }

        return;
    }

    buildPictures() {
        let pictures = this.state.files;
        let pics = [];

        for (let i=0; i<maxPics; i++){
            let id = 'picture_' + i;
            let file = pictures[id]? pictures[id] : null;

            pics.push(
                <ProfilePicture
                    id={ id }
                    key={ id }
                    file={ file }
                    main={ file && file.id === this.state.mainId? true : false }
                    updateFile={ (file) => this.updateOneFile(file, id) }
                    setMainPicture={ (fileId) => this.setMainPicture(fileId) }
                />
            );
        }

        return pics;
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
        return(
            <div id="picture" className="account-block" >
                { this.loading() }
                <h2 className="form-section">{ trans.get('USER.FIELDS.PROFILE_PIC') }</h2>

                <div className="user-pictures">
                    { this.buildPictures() }
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
        this.mainPicture.bind(this);
    }

    handleAttach = event => {
        this.attach_input.triggerClick();
    }

    mainPicture = event => {
        if (this.state.files.length !== 1){
            return;
        }

        let file = this.state.files[0];
        this.props.setMainPicture(file.id);

        this.addFile(file);
    }

    addFile(file) {
        if (!file.id){
            file.id = (new Date()).getTime();
        }
        file.place = this.props.id;

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
                    customAction={ this.props.main? null : {
                        icon    : "far fa-user-circle",
                        title   : trans.get('USER.FIELDS.DEFINE_PROFILE_PICTURE'),
                        onClick : () => this.mainPicture()
                    }}
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

    getClasses() {

        let classes = 'one-profile-picture';

        if (this.props.main){
            classes += ' main-picture';
        }

        return classes;
    }

    render() {
        return (
            <Dropzone
                id={ this.props.id }
                className={ this.getClasses() }
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