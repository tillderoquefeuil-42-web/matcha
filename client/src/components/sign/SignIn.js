
import React from 'react';
import { Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";

import API from '../../utils/API';
import alert from '../../utils/alert';
import utils from '../../utils/utils';
import trans from '../../translations/translate';


export class SignIn extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            username    : "",
            password    : ""
        };

        this.handleChange.bind(this);
        this.send.bind(this);
    }

    componentDidMount() {
        document.title = utils.generatePageTitle(trans.get('PAGE_TITLE.SIGN_IN'));
    }

    send = event => {
        let title = trans.get('ERROR.TITLE');

        if (this.state.username.length === 0 || this.state.password.length === 0){
            let msg = trans.get('ERROR.INVALID_PARAMETERS');
            alert.show({title: title, message: msg, type: 'error'});
            return;
        }

        API.signIn(this.state.username, this.state.password)
        .then(function(data){
            localStorage.setItem('token', data.data.token);
            window.location = "/home";
        }, API.catchError);
    }

    handleChange = event => {
        this.setState({
            [event.target.id]: event.target.value
        });
    }

    render() {
        return(
            <div>
                <FormGroup controlId="username" bsSize="large">
                    <ControlLabel>{ trans.get('USER.FIELDS.LOGIN') }</ControlLabel>
                    <FormControl autoFocus type="text" value={this.state.username} onChange={this.handleChange}/>
                </FormGroup>

                <FormGroup controlId="password" bsSize="large">
                    <ControlLabel>{ trans.get('USER.FIELDS.PASSWORD') }</ControlLabel>
                    <FormControl value={this.state.password} onChange={this.handleChange} type="password"/>
                    <a href="/user/resetPassword">{ trans.get('USER.FIELDS.PASSWORD_FORGOTTEN') }</a>
                </FormGroup>

                <Button
                    onClick={this.send}
                    block
                    bsSize="large"
                >
                    { trans.get('BUTTON.CONNECTION') }
                </Button>
                
            </div>
        );
    }
}