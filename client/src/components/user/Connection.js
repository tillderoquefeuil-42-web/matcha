import React from 'react';
import { Button, FormGroup, FormControl, ControlLabel, InputGroup } from "react-bootstrap";

import { EditEmail } from './EditEmail.js';
import { EditPassword } from './EditPassword.js';

import utils from '../../utils/utils';
import trans from '../../translations/translate';

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