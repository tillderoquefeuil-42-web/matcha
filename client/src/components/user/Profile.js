import React from 'react';
import { Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";

import { DatePickerInput } from '../datepicker/Datepicker';
import { Username } from '../sign/Username';
import { Language } from '../language/Language';

import API from '../../utils/API';
import alert from '../../utils/alert';
import utils from '../../utils/utils';
import trans from '../../translations/translate';

export class Profile extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            user        : utils.getLocalUser(),
        };

        this.handleChange.bind(this);
        this.saveUserData.bind(this);
    }

    handleChange = event => {

        let user = this.state.user;
        user[event.target.id] = event.target.value;
        
        this.setState({user:user});
    }

    setUsername(username) {
        let user = this.state.user;
        user.username = username;

        this.setState({user:user});
    }

    setBirthday(birthday) {
        let user = this.state.user;
        user.birthday = birthday;

        this.setState({user:user});
    }

    setLanguage(language) {
        let user = this.state.user;
        user.language = language;

        this.setState({user:user});
    }

    saveUserData = event => {
        let user = this.state.user;
        let _this = this;

        API.saveUserData(user)
        .then(function(data){
            let title = trans.get('SUCCESS.TITLE');
            let msg = trans.get('SUCCESS.DATA_SAVED');
            alert.show({title: title, message: msg, type: 'success'});

            let user = data.data.user;
            utils.setLocalUser(user);
            trans.setLocale(user.language, true);
            _this.setState({
                user    : user
            });
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

    render() {

        return(

            <div id="informations" className="account-block" >
                <h2 className="form-section">{ trans.get('COMMON.INFO') }</h2>

                <FormGroup controlId="bio">
                    <ControlLabel>{ trans.get('USER.FIELDS.BIO') }</ControlLabel>
                    <FormControl maxLength="250" componentClass="textarea" placeholder={ trans.get('USER.BIO_PLACEHOLDER') } autoFocus value={this.state.user.bio} onChange={this.handleChange} />
                </FormGroup>

                < Username 
                    value={ this.state.user.username }
                    firstname={ this.state.user.firstname }
                    lastname={ this.state.user.lastname }
                    onChange={(event) => this.handleChange(event)}
                    setUsername={(value) => this.setUsername(value)}
                />

                <FormGroup controlId="firstname" bsSize="large">
                    <ControlLabel>{ trans.get('USER.FIELDS.FIRSTNAME') }</ControlLabel>
                    <FormControl type="text" value={this.state.user.firstname} onChange={this.handleChange} />
                </FormGroup>

                <FormGroup controlId="lastname" bsSize="large">
                    <ControlLabel>{ trans.get('USER.FIELDS.LASTNAME') }</ControlLabel>
                    <FormControl type="text" value={this.state.user.lastname} onChange={this.handleChange} />
                </FormGroup>

                <FormGroup controlId="language" id="user-profile-language" >
                    <ControlLabel>{ trans.get('USER.FIELDS.LANGUAGE') }</ControlLabel>
                    <Language onSelect={ (value) => this.setLanguage(value) }/>
                </FormGroup>

                <FormGroup controlId="gender">
                    <ControlLabel>{ trans.get('USER.FIELDS.GENDER') }</ControlLabel>
                    <FormControl componentClass="select" value={this.state.user.gender} onChange={this.handleChange}>
                        <option value=""></option>
                        <option value="female">{ trans.get('USER.FIELDS.FEMALE') }</option>
                        <option value="male">{ trans.get('USER.FIELDS.MALE') }</option>
                        <option value="other">{ trans.get('USER.FIELDS.OTHER') }</option>
                    </FormControl>
                </FormGroup>

                <FormGroup controlId="orientation">
                    <ControlLabel>{ trans.get('USER.FIELDS.ORIENTATION') }</ControlLabel>
                    <FormControl componentClass="select" value={this.state.user.orientation} onChange={this.handleChange}>
                        <option value=""></option>
                        <option value="female">{ trans.get('USER.FIELDS.FEMALE') }</option>
                        <option value="male">{ trans.get('USER.FIELDS.MALE') }</option>
                        <option value="other">{ trans.get('USER.FIELDS.OTHER') }</option>
                        <option value="both">{ trans.get('USER.FIELDS.BOTH') }</option>
                    </FormControl>
                </FormGroup>

                <FormGroup controlId="birthday" bsSize="large">
                    <ControlLabel>{ trans.get('USER.FIELDS.BIRTHDAY') }</ControlLabel>
                    <DatePickerInput
                        date={ this.state.user.birthday }
                        onChange={(value) => this.setBirthday(value)}
                    />
                </FormGroup>

                <hr />

                <Button
                    onClick={this.saveUserData}
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