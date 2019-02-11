import React from 'react';
import { Button } from "react-bootstrap";

import { Logo } from '../images/Logo.js';

import API from '../../utils/API';
import alert from '../../utils/alert';
import utils from '../../utils/utils.js';
import trans from '../../translations/translate';

import './sign.css';

export class LockedAccount extends React.Component {

    constructor(props) {
        super(props);

        let params = utils.getQueryParameters(props);
        let unlocked = params.get('unlocked')? true : false;
        let email = params.get('email');

        this.state = {
            email       : email,
            unlocked    : unlocked
        }

        this.send.bind(this);
    }

    componentDidMount(){
        document.title = utils.generatePageTitle(trans.get('PAGE_TITLE.ACCOUNT_LOCKED'));
    }

    getLabel(){

        if (this.state.unlocked){
            return trans.get('SUCCESS.USER_UNLOCKED');
        }
        
        return trans.get('ERROR.USER_LOCKED');
    }

    getLink(){

        if (this.state.unlocked){
            return trans.get('COMMON.GO_BACK');
        }
        
        return trans.get('MAIL.RESENT');
    }
    
    send = event => {
        if (this.state.unlocked){
            window.location = '/';

        } else if (this.state.email){
            API.sendLockedAccount(this.state.email)
            .then(function(data){
                let title = trans.get('SUCCESS.TITLE');
                let msg = trans.get('SUCCESS.SENT');
                if (msg){
                    alert.show({title: title, message: msg, type: 'success'});
                }
            }, function(error){
                if (error.response) {
                    if (API.redirection(error.response.data)){
                        return;
                    }
                    let title = trans.get('ERROR.TITLE');
                    let msg = trans.get('ERROR.' + error.response.data.text);
                    if (msg){
                        alert.show({title: title, message: msg, type: 'error'});
                    }
                }
                return;
            });
        }

        return;
    }
    
    render() {
        return(
            <div className="flex-center">
                <div className="sign well">

                    <Logo withTitle />

                    <hr />

                    <h1>{ this.getLabel() }</h1>

                    <hr />

                    <Button
                        onClick={this.send}
                        type="submit"
                    >
                        { this.getLink() }
                    </Button>

                </div>
            </div>
        );
    }
}