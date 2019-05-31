import React from 'react';
import { ControlLabel } from "react-bootstrap";

import { Logo } from '../images/Logo.js';

import utils from '../../utils/utils';
import trans from '../../translations/translate';

import './sign.css';

export class ValidateAccount extends React.Component {


    constructor(props) {
        super(props);

        let params = utils.getQueryParameters(props);
        let valid = params.get('valid')? true : false;

        this.state = {
            valid   : valid
        }
    }

    componentDidMount(){
        document.title = utils.generatePageTitle(trans.get('PAGE_TITLE.ACCOUNT_VALIDATION'));

        setTimeout(function(){
            window.location = "/";
        }, 5000);
    }

    getLabel(){

        if (this.state.valid){
            return <h3>{ trans.get('USER.ACCOUNT_ALREADY_VALID') }</h3>
        }
        
        return <h3>{ trans.get('USER.ACCOUNT_VALIDATE') }</h3>
    }

    render() {
        return(
            <div className="flex-center">
                <div className="sign well">

                    <Logo withTitle />

                    <hr />

                    <div>
                        <ControlLabel>
                            { this.getLabel() }
                            { trans.get('COMMON.REDIRECTION') }
                        </ControlLabel>
                    </div>

                </div>
            </div>
        );
    }
}