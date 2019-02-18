import React from 'react';
import { Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";

import API from '../../utils/API';
import alert from '../../utils/alert';
import utils from '../../utils/utils';
import trans from '../../translations/translate';
import filesManager from '../../utils/files';


const uploadURL = '/uploads/pictures/';

export class Picture extends React.Component {

    constructor(props) {
        super(props);

        let user = utils.getLocalUser();

        this.state = {
            user        : user,
            preview_url : (user.profile_picture? uploadURL + user.profile_picture : null),
            file        : ''
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

        let file = this.state.file;
        let files = {};

        if (!file){
            let title = trans.get('ERROR.TITLE');
            let msg = trans.get('ERROR.INVALID_PARAMETERS');
            alert.show({title: title, message: msg, type: 'error'});
            return;
        }

        files[file.id] = file;

        let params = {
            file_case   : 'profile_picture'
        }

        filesManager.setSocket(this.socket);
        filesManager.sendFiles(files, params);

    }

    updateProfilePicture(user) {

        let title = trans.get('SUCCESS.TITLE');
        let msg = trans.get('SUCCESS.PICTURE_SAVED');
        alert.show({title: title, message: msg, type: 'success'});

        utils.setLocalUser(user);
    }

    _handleSubmit = event => {
        let _this = this;

        API.saveUserPicture(this.state.file)
        .then(function(data){
            let title = trans.get('SUCCESS.TITLE');
            let msg = trans.get('SUCCESS.PICTURE_SAVED');
            alert.show({title: title, message: msg, type: 'success'});

            let user = data.data.user;
            utils.setLocalUser(user);
            _this.setState({
                user        : user,
                preview_url : (user.profile_picture? uploadURL + user.profile_picture : null)
            });
        }, API.catchError);
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