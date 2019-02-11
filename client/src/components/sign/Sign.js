import React from 'react';
import { Button } from "react-bootstrap";

import { SignIn } from './SignIn.js';
import { SignUp } from './SignUp.js';
import { Language } from '../language/Language.js';
import { Logo } from '../images/Logo.js';

import trans from '../../translations/translate';

import './sign.css';

export class Sign extends React.Component {

    constructor(props) {
        super(props);

        let state = (this.props.match.params.state === 'up')? false : true;

        this.state = {
            in  : state
        };

        this.send.bind(this);
    }

    getSign() {
        
        if (this.state.in === true){
            return (< SignIn />);
        } else {
            return (< SignUp />);
        }
        
    }

    getBtnName(){
        return trans.get('BUTTON.' + (this.state.in === true? "SIGN_UP" : "SIGN_IN"));
    }

    getGoogleLink(){
        return `http://localhost:8000/auth/google?locale=${ trans.getLocale() }`;
    }

    send = event => {
        this.setState({
            in: !this.state.in
        });
    }

    render() {
        return(
            <div className="flex-center">
                <div className="sign well">
                    <Logo withTitle />

                    <hr />

                    <div className="btn-group-social">
                        <a href={ this.getGoogleLink() } className="btn btn-lg btn-google">
                            <i className="fab fa-google"></i> 
                            { trans.get('BUTTON.GOOGLE') }
                        </a>
                    </div>

                    <hr />

                    { this.getSign() }

                    <hr />

                    <Button
                        onClick={this.send}
                        block
                        bsSize="large"
                    >
                        { this.getBtnName() }
                    </Button>

                    <hr />

                    <Language />

                </div>
            </div>
        );
    }
}