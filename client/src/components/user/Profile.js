import React from 'react';
import { Button, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';

import { DatePickerInput } from '../datepicker/Datepicker';
import { Username } from '../sign/Username';
import { Language } from '../language/Language';
import { TagsInput } from '../tagsInput/TagsInput';

import API from '../../utils/API';
import alert from '../../utils/alert';
import utils from '../../utils/utils';
import trans from '../../translations/translate';

export class Profile extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            user        : utils.getLocalUser(),
            tags        : []
        };

        this.handleChange.bind(this);
        this.saveUserData.bind(this);
    }


    // USEFULL

    handleChange = event => {

        let user = this.state.user;
        let target = event.target;

        let value = (target.type === 'checkbox')? target.checked : target.value;
        let name = target.id;

        user[name] = value;
        this.setState({user:user});
    }


    // TAGS INPUT

    handleTagDelete(i) {
        let tags = this.state.tags.slice(0)
        tags.splice(i, 1);
        this.setState({tags})
    }

    handleTagAddition(tag) {
        let tags = [].concat(this.state.tags, tag);
        this.setState({tags})
    }


    // SETTERS

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

    setTags(tags) {
        let user = this.state.user;
        user.tags = tags;

        this.setState({user:user});
    }


    // SAVER

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

                <FormGroup controlId="interests">
                    <ControlLabel>{ trans.get('USER.FIELDS.INTERESTS') }</ControlLabel>
                    <TagsInput
                        tags={ this.state.user.tags }
                        onChange={(value) => this.setTags(value)}
                    />
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
                        <option value="nb">{ trans.get('USER.FIELDS.NB') }</option>
                    </FormControl>
                </FormGroup>

                <FormGroup controlId="orientation" id="user-profile-orientation">
                    <ControlLabel>{ trans.get('USER.FIELDS.ORIENTATION') }</ControlLabel>
                    <div className="orientation-checkboxes">
                        <label>
                            <input
                                id="see_f"
                                type="checkbox"
                                onChange={ this.handleChange }
                                defaultChecked={ this.state.user.see_f }
                            />
                            { trans.get('USER.FIELDS.FEMALE') }
                        </label>

                        <label>
                            <input
                                id="see_m"
                                type="checkbox"
                                onChange={ this.handleChange }
                                defaultChecked={ this.state.user.see_m }
                            />
                            { trans.get('USER.FIELDS.MALE') }
                        </label>

                        <label>
                            <input
                                id="see_nb"
                                type="checkbox"
                                onChange={ this.handleChange }
                                defaultChecked={ this.state.user.see_nb }
                            />
                            { trans.get('USER.FIELDS.NB') }
                        </label>
                    </div>
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