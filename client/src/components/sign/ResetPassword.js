import React from 'react';
import { Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";

import { Logo } from '../images/Logo.js';

import API from '../../utils/API';
import utils from '../../utils/utils';
import alert from '../../utils/alert';
import trans from '../../translations/translate';

import './sign.css';

export class ResetPassword extends React.Component {

    constructor(props) {
        super(props);

        let params = utils.getQueryParameters(props);
        let token = params.get('token');

        this.state = {
            status      : (token? 'EMAIL_LINK' : ''),
            email       : "",
            token       : token,
            password    : "",
            cpassword   : ""
        };

        this.handleChange.bind(this);
        this.sendMail.bind(this);
        this.sendPassword.bind(this);
    }

    componentDidMount() {
        document.title = utils.generatePageTitle(trans.get('PAGE_TITLE.RESET_PASSWORD'));
    }


    handleChange = event => {
        this.setState({
            [event.target.id]: event.target.value
        });
    }
    
    sendMail = event => {
        if (this.state.email.length === 0){
            return;
        }

        let _this = this;

        let title = trans.get('INFO.TITLE');
        let msg = trans.get('INFO.MAIL_SENDING');
        let infoId = alert.show({title: title, message: msg, type: 'info'});
        
        setTimeout(function(){
            API.resetPassword(_this.state.email)
            .then(function(data){
                alert.close(infoId);

                let title = trans.get('SUCCESS.TITLE');
                let msg = trans.get('SUCCESS.MAIL_SENT');
                alert.show({title: title, message: msg, type: 'success'});
                
                _this.setState({status:"EMAIL_SEND"});
            }, function(error){
                alert.close(infoId);
                
                if (error.response) {

                    let title = trans.get('ERROR.TITLE');
                    let msg = trans.get('ERROR.' + error.response.data.text);
                    alert.show({title: title, message: msg, type: 'error'});
                }
                
                return;
           });
        }, 2000);
    }

    sendPassword = event => {
        
        let title = trans.get('ERROR.TITLE');

        if (this.state.password.length === 0){
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

        API.savePswdByToken(this.state.token, this.state.password)
        .then(function(data){
            window.location = "/";
        }, function(error){
            if (error.response) {
                let msg = trans.get('ERROR.' + error.response.data.text);
                alert.show({title: title, message: msg, type: 'error'});
            }
            return;
        });
    }

    build(){

        switch (this.state.status){

            default:
            case "":
            case "EMAIL_INPUT":
                return this.buildEmailInput();
            case "EMAIL_SEND":
                return this.buildEmailSend();
            case "EMAIL_LINK":
                return this.buildEmailLink();
        }
            
    }

    buildEmailInput(){
        return (
            <div>
                <FormGroup controlId="email" bsSize="large">
                    <ControlLabel>{ trans.get('USER.RESET_PASSWORD_FIELD') }</ControlLabel>
                    <FormControl autoFocus placeholder="Email" type="email" value={this.state.email} onChange={this.handleChange}/>
                </FormGroup>

                <Button
                    onClick={this.sendMail}
                    block
                    bsSize="large"
                    type="submit"
                >
                    { trans.get('BUTTON.CONFIRM') }
                </Button>
            </div>
        );
    }
    
    buildEmailSend(){
        return (
            <div>
                <ControlLabel>{ trans.get('USER.RESET_PASSWORD_INFO') }</ControlLabel>
                
                <Button
                    href="/"
                    block
                    bsSize="large"
                >
                    { trans.get('COMMON.GO_BACK') }
                </Button>
            </div>
        );
    }
    
    buildEmailLink(){
        return (
            <div>
                <ControlLabel>{ trans.get('USER.SET_NEW_PASSWORD') }</ControlLabel>

                <FormGroup controlId="password" bsSize="large">
                    <ControlLabel>{ trans.get('USER.NEW_PASSWORD') }</ControlLabel>
                    <FormControl type="password" value={this.state.password} onChange={this.handleChange} />
                </FormGroup>

                <FormGroup controlId="cpassword" bsSize="large">
                    <ControlLabel>{ trans.get('USER.CONFIRM_PASSWORD') }</ControlLabel>
                    <FormControl type="password" value={this.state.cpassword} onChange={this.handleChange} />
                </FormGroup>

                <Button
                    onClick={this.sendPassword}
                    block
                    bsSize="large"
                >
                    { trans.get('BUTTON.CONFIRM') }
                </Button>
            </div>
        );

    }
        
    render() {
        return(
            <div className="flex-center">
                <div className="sign well">

                    <Logo withTitle />

                    <hr />

                    { this.build() }
                </div>
            </div>
        );
    }
}