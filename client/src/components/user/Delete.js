import React from 'react';
import { Button, FormGroup, ControlLabel } from "react-bootstrap";

import API from '../../utils/API';
import trans from '../../translations/translate';

export class Delete extends React.Component {

    confirmAction() {

        if(window.confirm(trans.get('USER.FIELDS.DELETE_ACCOUNT_CONFIRM'))){
            API.deleteAccount()
            .then(result => {
                API.signOut();
                window.location = "/user/sign";
            });
        }
    }

    render() {

        return (

            <div id="delete-account" className="account-block">

                <h2 className="form-section">{ trans.get('USER.DELETE_ACCOUNT') }</h2>

                <FormGroup controlId="delete-account-form" bsSize="large">
                    <ControlLabel>{ trans.get('USER.FIELDS.DELETE_ACCOUNT') }</ControlLabel>
                    <Button
                        block
                        bsSize="large"
                        bsStyle="danger"
                        onClick={ () => this.confirmAction() }
                    >
                        { trans.get('BUTTON.DELETE') }
                    </Button>
                </FormGroup>
            </div>
        );
    }
}