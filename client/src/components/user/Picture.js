import React from 'react';
import { Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";

import { Dropzone, FileContainer } from '../images/Dropzone';

import alert from '../../utils/alert';
import utils from '../../utils/utils';
import trans from '../../translations/translate';
import filesManager from '../../utils/files';

export class Picture extends React.Component {

    constructor(props) {
        super(props);

        let user = utils.getLocalUser();

        this.state = {
            user        : user,
            preview_url : null,
            file        : user.profile_pic,
            files       : [],
            uploading   : 0
        };

        this.socket = props._g.socket;

        this.handleChange.bind(this);
        this.handleSubmit.bind(this);

    }

    componentDidMount() {
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

    handleChange = event => {
        let file = event.target.files[0];

        let reader = new FileReader();
        reader.onloadend = () => {
            this.setState({
                file        : file,
                preview_url : reader.result
            });
        }

        reader.readAsDataURL(file);
    }

    handleSubmit = event => {

        let files = {};
        let length = 0;

        if (this.state.file && this.state.file._id){
            let file = this.state.file;
            file.status = 'profile_picture';
            files[file.id] = file;
            length++;
        }

        if (this.state.files){
            for (let i in this.state.files){
                let file = this.state.files[i];
                if (file._id){
                    continue;
                }
                file.status = 'other_picture';
                files[file.id] = file;
                length++;
            }
        }

        if (!length){
            let title = trans.get('ERROR.TITLE');
            let msg = trans.get('ERROR.INVALID_PARAMETERS');
            alert.show({title: title, message: msg, type: 'error'});
            return;
        }

        this.setState({
            uploading   : length
        });

        let params = {
            file_case   : 'profile_picture'
        }

        filesManager.setSocket(this.socket);
        filesManager.sendFiles(files, params);
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


    getProfilePicture() {
        let user = utils.getLocalUser();
        let url;

        if (this.state.preview_url){
            url = this.state.preview_url;
        } else if (user.profile_pic && user.profile_pic.filename){
            url = `http://localhost:8000/file/private?filename=${user.profile_pic.filename}`;
        } if (url){
            return (
                <img src={ url } alt={ trans.get('USER.FIELDS.PROFILE_PIC') } />
            );
        }

        return (
            <i>{ trans.get('DROPZONE.PREVIEW') }</i>
        );
    }


    addOneFile(file) {
        let files = this.state.files;
        files.push(file);

        this.setState({files : files});
    }

    removeOneFile(fileId) {
        let files = [];

        for (let i in this.state.files){
            let file = this.state.files[i];

            if (file.id !== fileId){
                files.push(file);
            }
        }

        this.setState({files : files});
    }


    render() {

        return(

            <div id="picture" className="account-block" >
                <h2 className="form-section">{ trans.get('USER.FIELDS.PROFILE_PIC') }</h2>

                <FormGroup controlId="profile_picture" bsSize="large">
                    <ControlLabel>{ trans.get('USER.FIELDS.PROFILE_PIC') }</ControlLabel>
                    <FormControl type="file" onChange={ this.handleChange } />
                </FormGroup>

                <div className="profile-picture-preview">
                    { this.getProfilePicture() }
                </div>

                <Dropzone
                    className="other-pictures"
                    files={ this.state.files }
                    addFile={ (file) => this.addOneFile(file) }
                    maxFiles={ 4 }
                >
                    <i>{ trans.get('USER.FIELDS.OTHER_PIC') }</i>
                    <FileContainer
                        files={ this.state.files }
                        removeFile={ (fileId) => this.removeOneFile(fileId) }
                    />
                </Dropzone>

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