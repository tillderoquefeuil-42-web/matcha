import React from 'react';
import { DropdownButton, MenuItem } from "react-bootstrap";

import trans from '../../translations/translate';

import '../../css/famfamfam/famfamfam-flags.css';

export class Language extends React.Component {
    constructor(props){
        super(props);

        let locale = this.props.locale? this.props.locale : trans.getLocale();

        this.state = {
            locale  : locale
        };

        this.handleSelect.bind(this);
    }

    handleSelect = (value) => {
        if (this.props.onSelect){
            this.props.onSelect(value);
            this.setState({locale : value});
        } else {
            trans.setLocale(value, true);
        }
    }

    getFlagByLg(lg) {
        return trans.supported[lg];
    }

    buildTitle() {
        return (
            <i className={ this.getFlagByLg(this.state.locale) } ></i>
        );
    }

    render() {

        return (
            <DropdownButton
                id="btn-language"
                title={ this.buildTitle() }
                onSelect={ this.handleSelect }
            >
                <MenuItem eventKey="en">
                    <i className="famfamfam-flag-gb"></i> - { trans.get('LANGUAGE.EN') }
                    </MenuItem>
                <MenuItem eventKey="fr">
                    <i className="famfamfam-flag-fr"></i> - { trans.get('LANGUAGE.FR') }
                </MenuItem>
            </DropdownButton>
        );
    }

}