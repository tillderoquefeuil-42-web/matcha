
import React from 'react';
import { Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";

import { Username } from './Username.js';

import API from '../../utils/API';
import utils from '../../utils/utils';
import alert from '../../utils/alert';
import trans from '../../translations/translate';


export class SignUp extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            email       : "",
            password    : "",
            cpassword   : "",
            username    : "",
            firstname   : "",
            lastname    : "",
        }

        this.handleChange.bind(this);
        this.send.bind(this);
    }

    componentDidMount() {
        document.title = utils.generatePageTitle(trans.get('PAGE_TITLE.SIGN_UP'));
    }

    send = event => {
        let title = trans.get('ERROR.TITLE');

        if (this.state.password !== this.state.cpassword){
            let msg = trans.get('ERROR.NO_PASSWORD_MATCH');
            alert.show({title: title, message: msg, type: 'error'});
            return;
            
        } if (this.state.password && !utils.pswdStrength(this.state.password)){
            let msg = trans.get('ERROR.PASSWORD_STRENGTH');
            alert.show({title: title, message: msg, type: 'error', timeout: 60000});
            return;
        }

        var _send = {
            email       : this.state.email,
            password    : this.state.password,
            username    : this.state.username,
            firstname   : this.state.firstname,
            lastname    : this.state.lastname,
            language    : trans.getLocale()
        }

        API.signUp(_send).then(function(data){

            let title = trans.get('SUCCESS.TITLE');
            let msg = trans.get('MAIL.VALIDATE_ACCOUNT');

            alert.closeAll();
            alert.show({title: title, message: msg, type: 'success'});
            setTimeout(function(){
                localStorage.setItem('token', data.data.token);
                window.location = "/home"
            }, 5000);
        }, API.catchError);
    }

    handleChange = event => {

        this.setState({
            [event.target.id]   : event.target.value,
            actual_focus        : event.target.id,
        });
        
    }

    render() {
        return(
            <div>

                <FormGroup controlId="firstname" bsSize="large">
                    <ControlLabel>{ trans.get('USER.FIELDS.FIRSTNAME') }</ControlLabel>
                    <FormControl type="text" autoFocus value={this.state.firstname} onChange={this.handleChange} />
                </FormGroup>

                <FormGroup controlId="lastname" bsSize="large">
                    <ControlLabel>{ trans.get('USER.FIELDS.LASTNAME') }</ControlLabel>
                    <FormControl type="text" value={this.state.lastname} onChange={this.handleChange} />
                </FormGroup>

                < Username 
                    value={ this.state.username }
                    firstname={ this.state.firstname }
                    lastname={ this.state.lastname }
                    onChange={(event) => this.handleChange(event)}
                    setUsername={(value) => this.setState({username:value})}
                />

                <FormGroup controlId="email" bsSize="large">
                    <ControlLabel>{ trans.get('USER.FIELDS.EMAIL') }</ControlLabel>
                    <FormControl type="email" value={this.state.email} onChange={this.handleChange} />
                </FormGroup>

                <FormGroup controlId="password" bsSize="large">
                    <ControlLabel>{ trans.get('USER.FIELDS.PASSWORD') }</ControlLabel>
                    <FormControl type="password" value={this.state.password} onChange={this.handleChange} />
                </FormGroup>

                <FormGroup controlId="cpassword" bsSize="large">
                    <ControlLabel>{ trans.get('USER.FIELDS.CONFIRM_PASSWORD') }</ControlLabel>
                    <FormControl type="password" value={this.state.cpassword} onChange={this.handleChange} />
                </FormGroup>

                <Button
                    onClick={this.send}
                    block
                    bsSize="large"
                >
                    { trans.get('BUTTON.REGISTRATION') }
                </Button>

            </div>
        );
    }
}