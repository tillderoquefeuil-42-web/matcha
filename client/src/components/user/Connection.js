import React from 'react';
import { Button, FormGroup, FormControl, ControlLabel, InputGroup } from "react-bootstrap";

import { SuperModal } from '../modal/CustomModal';

import utils from '../../utils/utils';
import API from '../../utils/API';
import alert from '../../utils/alert';
import trans from '../../translations/translate';

import './user.css';

export class Connection extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            user        : utils.getLocalUser(),
            editEmail   : this.allowedToEditEmail(),
            modals      : {
                email       : false,
                password    : false
            }
        };
    }

    allowedToEditEmail(){
        let user = utils.getLocalUser();
        const allowed = 'local';

        if (user && user.providers && user.providers.indexOf(allowed) !== -1){
            return true;
        }

        return false;
    }

    openModal = name => {
        let modals = this.state.modals;
        modals[name] = true;

        this.setState({
            modals      : modals,
            editEmail   : this.allowedToEditEmail(),
            user        : utils.getLocalUser()
        });
    }
    
    closeModal = name => {
        let modals = this.state.modals;
        modals[name] = false;

        this.setState({
            modals  :modals,
            user    : utils.getLocalUser()
        });
    }


    render() {

        return (

            <div id="connection" className="account-block">

                <EditEmail
                    show={ this.state.modals.email }
                    onClose={ () => this.closeModal("email") }
                />

                <EditPassword
                    show={ this.state.modals.password }
                    onClose={ () => this.closeModal("password") }
                />

                <h2 className="form-section">{ trans.get('USER.CONNECTION') }</h2>
                
                <FormGroup controlId="email" bsSize="large">
                    <ControlLabel>{ trans.get('USER.FIELDS.EMAIL') }</ControlLabel>
                    <InputGroup>
                        <FormControl type="email" value={this.state.user.email} readOnly />
                        <InputGroup.Button>
                            <Button
                                id="email-edit-btn"
                                onClick={ () => this.openModal("email") }
                                bsStyle="primary"
                                bsSize="large"
                                disabled={ !this.allowedToEditEmail() }
                            >
                                { trans.get('BUTTON.EDIT') }
                            </Button>
                        </InputGroup.Button>
                    </InputGroup>
                    { this.allowedToEditEmail()? '' : <i>{ trans.get('USER.EDIT_EMAIL') }</i> }
                </FormGroup>

                <FormGroup controlId="password" bsSize="large">
                    <ControlLabel>{ trans.get('USER.FIELDS.PASSWORD') }</ControlLabel>
                    <InputGroup>
                        <FormControl type="password" value="*********" readOnly />
                        <InputGroup.Button>
                            <Button
                                onClick={ () => this.openModal("password") }
                                bsStyle="primary"
                                bsSize="large"
                            >
                                { trans.get('BUTTON.EDIT') }
                            </Button>
                        </InputGroup.Button>
                    </InputGroup>
                </FormGroup>
            </div>
        );
    }
}

class EditPassword extends SuperModal {

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

class EditEmail extends SuperModal {

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