import React from 'react';
import { Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";

import { Component } from '../Component';
import { SuperModal } from '../modal/CustomModal';

import utils from '../../utils/utils';
import API from '../../utils/API';
import alert from '../../utils/alert';
import trans from '../../translations/translate';

export class Delete extends Component {

    constructor(props) {
        super(props);

        this.state = {
            modal   : false
        };
    }

    openModal() {
        this.setState({modal : true});
    }

    closeModal() {
        this.setState({modal : false});
    }

    render() {

        return (

            <div id="delete-account" className="account-block">

                <DeleteCheck
                    show={ this.state.modal }
                    onClose={ () => this.closeModal() }
                />

                <h2 className="form-section">{ trans.get('USER.DELETE_ACCOUNT') }</h2>

                <FormGroup controlId="delete-account-form" bsSize="large">
                    <ControlLabel>{ trans.get('USER.FIELDS.DELETE_ACCOUNT') }</ControlLabel>
                    <Button
                        block
                        bsSize="large"
                        bsStyle="danger"
                        onClick={ () => this.openModal() }
                    >
                        { trans.get('BUTTON.DELETE') }
                    </Button>
                </FormGroup>
            </div>
        );
    }
}

class DeleteCheck extends SuperModal {

    constructor(props) {
        super(props);

        let user = utils.getLocalUser();
        this.state = {
            user        : user,
            password    : '',
            hasPassword : this.hasPassword()
        };

        this.handleChange.bind(this);
    }

    handleChange = event => {
        this.setState({
            [event.target.id]: event.target.value
        });
    }

    send = event => {
        let title = trans.get('ERROR.TITLE');

        if (this.state.hasPassword && !this.state.password.length){
            let msg = trans.get('ERROR.INVALID_PARAMETERS');
            alert.show({title: title, message: msg, type: 'error'});
            return;
        }

        API.deleteAccount(this.state.password)
        .then(result => {
            API.signOut();
            window.location = "/user/sign";
        }, API.catchError);
    }

    hasPassword() {
        let user = utils.getLocalUser();
        const allowed = 'local';

        if (user && user.providers && user.providers.indexOf(allowed) !== -1){
            return true;
        }

        return false;
    }


    buildtitle() {
        return trans.get('USER.DELETE_ACCOUNT');
    }

    buildPasswordInput() {

        if (!this.state.hasPassword){
            return;
        }

        return (
            <div>
                <FormGroup controlId="password" bsSize="large">
                    <ControlLabel>{ trans.get('USER.FIELDS.PASSWORD') }</ControlLabel>
                    <FormControl type="password" value={this.state.password} onChange={this.handleChange} />
                </FormGroup>
                <hr />
            </div>
        );

    }

    buildbody() {

        return(

            <div id="check-password">

                { this.buildPasswordInput() }

                <b>{ trans.get('USER.FIELDS.DELETE_ACCOUNT_CONFIRM') }</b>

                <Button
                    onClick={this.send}
                    block
                    bsStyle="danger"
                    bsSize="large"
                >
                    { trans.get('BUTTON.DELETE') }
                </Button>
            </div>
        );
    }

}