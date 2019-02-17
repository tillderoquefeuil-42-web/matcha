import React from 'react';
import { Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";

import { SuperModal } from '../modal/CustomModal';

import utils from '../../utils/utils';
import API from '../../utils/API';
import alert from '../../utils/alert';
import trans from '../../translations/translate';

import './user.css';

export class EditPassword extends SuperModal {

    constructor(props) {
        super(props);

        let user = utils.getLocalUser();
        this.state = {
            user        : user,
            opassword   : '',
            password    : '',
            cpassword   : ''
        };

        this.handleChange.bind(this);
    }

    handleChange = event => {
        this.setState({
            [event.target.id]: event.target.value
        });
    }

    send = event => {
        let _this = this;
        let title = trans.get('ERROR.TITLE');

        if ((!this.state.opassword.length && this.hasLocalProvider()) || !this.state.password.length){
            let msg = trans.get('ERROR.INVALID_PARAMETERS');
            alert.show({title: title, message: msg, type: 'error'});
            return;

        } if (this.state.password !== this.state.cpassword){
            let msg = trans.get('ERROR.NO_PASSWORD_MATCH');
            alert.show({title: title, message: msg, type: 'error'});
            return;

        } if (this.state.password && !utils.pswdStrength(this.state.password)){
            let msg = trans.get('ERROR.PASSWORD_STRENGTH');
            alert.show({title: title, message: msg, type: 'error', timeout: 60000});
            return;
        }

        API.saveNewPassword(this.state.opassword, this.state.password)
        .then(function(data){
            localStorage.setItem('token', data.data.token);
            let user = data.data.user;
            utils.setLocalUser(user);
            _this.setState({
                user    : user
            });

            let title = trans.get('SUCCESS.TITLE');
            let msg = trans.get('SUCCESS.PASSWORD_SAVED');
            alert.closeAll();
            alert.show({title: title, message: msg, type: 'success'});
            _this.props.onClose();

        }, API.catchError);

    }

    hasLocalProvider = function(){
        let providers = this.state.user.providers;
        const allowed = 'local';

        if (providers && providers.indexOf(allowed) !== -1){
            return true;
        }

        return false;
    }

    buildtitle() {
        return trans.get('USER.EDIT_PASSWORD');
    }

    buildbody() {

        return(

            <div id="edit-password">

                <FormGroup controlId="opassword" bsSize="large">
                    <ControlLabel>{ trans.get('USER.FIELDS.OLD_PASSWORD') }</ControlLabel>
                    <FormControl type="password" value={this.state.opassword} onChange={this.handleChange} disabled={ !this.hasLocalProvider() } />
                </FormGroup>

                <FormGroup controlId="password" bsSize="large">
                    <ControlLabel>{ trans.get('USER.FIELDS.NEW_PASSWORD') }</ControlLabel>
                    <FormControl type="password" value={this.state.password} onChange={this.handleChange} />
                </FormGroup>

                <FormGroup controlId="cpassword" bsSize="large">
                    <ControlLabel>{ trans.get('USER.FIELDS.CONFIRM_PASSWORD') }</ControlLabel>
                    <FormControl type="password" value={this.state.cpassword} onChange={this.handleChange} />
                </FormGroup>
                <hr />

                <Button
                    onClick={this.send}
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