
import React from 'react';
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";

import utils from '../../utils/utils';
import API from '../../utils/API';
import alert from '../../utils/alert';
import trans from '../../translations/translate';

function Suggestion(props){
    return (
        <button 
            className="btn-xs" 
            onClick={props.onClick}
        >
            {props.value}
        </button>
    );
}

export class Username extends React.Component {

    constructor(props) {
        super(props);

        let user = utils.getLocalUser();

        this.state = {
            suggests    : [],
            user_id     : (user? user._id : null)
        };
    }

    handleChange = event => {
        this.props.onChange(event);
    }

    handleBlur = event => {
        let username = this.props.value;

        API.checkUsernames([username], this.state.user_id)
        .then(function(data){
            alert.closeAll();
            return;
        }, function(error){
            console.log(error);
            let title = trans.get('ERROR.TITLE');
            let msg = trans.get('ERROR.' + error.response.data.text);
            alert.show({title: title, message: msg, type: 'error', timeout: 600000});
            return;
        });
    }
    
    handleFocus = event => {

        let _this = this;
        let suggests = this.generateSuggests();

        API.checkUsernames(suggests).then(function(data){
            if (data.data.already_used && data.data.already_used.length > 0){
                suggests = _this.filterSuggests(suggests, data.data.already_used);
            }

            _this.setState({
                suggests : suggests
            });
            
        }, function(error){
            return;
        });


    }

    filterSuggests(suggests, alreadyUsed){
        let data = [];

        for (var i in suggests){
            let suggest = suggests[i];
            let used = false;
            for (var j in alreadyUsed){
                if (alreadyUsed[j] === suggest){
                    used = true;
                    break;
                }
            }

            if (used){
                continue;
            }

            data.push(suggest);
        }

        return data;
    }
    
    suggestSelected = i => {
        let suggest = this.state.suggests[i];
        this.props.setUsername(suggest);
    }
    
    renderSuggestion(i){
        return (
            <Suggestion
                key={i}
                value={this.state.suggests[i]}
                onClick={() => this.suggestSelected(i)}
            />
        );
    };

    buildSuggestions() {
        
        if (!this.state.suggests.length){
            return;
        }
        
        let suggests = [];
        for (var i in this.state.suggests){
            suggests.push(this.renderSuggestion(i));
        }
        
        return (
            <div className="sign-suggests">
                <i>{ trans.get('USER.SUGGESTIONS') } :</i>
                { suggests }
            </div>
        );
        
    }

    generateSuggests() {
        
        if (!this.props.firstname.trim().length || !this.props.lastname.trim().length){
            return [];
        }

        let name = this.props.firstname.trim() + ' ' + this.props.lastname.trim();

        const separators = ['', '.', '-', '_'];

        let suggests = [];
        for (var i in separators){
            let suggest = utils.slugify(name, separators[i]);
            suggests.push(suggest);
        }

        return suggests;
    }
    
    render() {
        return(
            <FormGroup controlId="username" bsSize="large">
                <ControlLabel>{ trans.get('USER.FIELDS.USERNAME') }</ControlLabel>
                <FormControl 
                    type="text" 
                    value={ this.props.value } 
                    onChange={ this.handleChange } 
                    onFocus={ this.handleFocus } 
                    onBlur={ this.handleBlur }
                />
                <div>
                    <span>{ this.buildSuggestions() }</span>
                </div>
            </FormGroup>
        );
    }
}