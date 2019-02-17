import React from 'react';
import { Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";

import { SuperModal } from '../modal/CustomModal';

import API from '../../utils/API';
import alert from '../../utils/alert';
import utils from '../../utils/utils';
import trans from '../../translations/translate';

import './user.css';

export class EditEmail extends SuperModal {

    constructor(props) {
        super(props);

        let user = utils.getLocalUser();
        this.state = {
            user    : user,
            password: '',
            email   : '',
            cemail  : ''
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

        if (this.state.email.length === 0 || this.state.password.length === 0){
            let msg = trans.get('ERROR.INVALID_PARAMETERS');
            alert.show({title: title, message: msg, type: 'error'});
            return;
        }
        
        if (this.state.email.trim() !== this.state.cemail.trim()){
            let msg = trans.get('ERROR.NO_EMAIL_MATCH');
            alert.show({title: title, message: msg, type: 'error'});
            return;
        }

        if (this.state.email.trim() === this.state.user.email.trim()){
            let msg = trans.get('ERROR.OLD_EMAIL_MATCH');
            alert.show({title: title, message: msg, type: 'error'});
            return;
        }


        API.saveNewEmail(this.state.email, this.state.password)
        .then(function(data){
            localStorage.setItem('token', data.data.token);

            let title = trans.get('SUCCESS.TITLE');
            let msg = trans.get('MAIL.VALIDATE_EMAIL');
            alert.show({title: title, message: msg, type: 'success'});
            let user = data.data.user;
            utils.setLocalUser(user);

            _this.props.onClose();

        }, API.catchError);
    }

    buildtitle() {
        return trans.get('USER.EMAIL_EDIT');
    }

    buildbody() {
        return(
            
            <div id="edit-email">

                <FormGroup controlId="password" bsSize="large">
                    <ControlLabel>{ trans.get('USER.FIELDS.PASSWORD') }</ControlLabel>
                    <FormControl value={this.state.password} onChange={this.handleChange} type="password"/>
                </FormGroup>

                <FormGroup controlId="email" bsSize="large">
                    <ControlLabel>{ trans.get('USER.NEW_EMAIL_ADDRESS') }</ControlLabel>
                    <FormControl type="email" value={this.state.email} onChange={this.handleChange} />
                </FormGroup>

                <FormGroup controlId="cemail" bsSize="large">
                    <ControlLabel>{ trans.get('USER.NEW_EMAIL_CONFIRM') }</ControlLabel>
                    <FormControl type="cemail" value={this.state.cemail} onChange={this.handleChange} />
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