
import React from 'react';
import { Route, Redirect } from 'react-router-dom';

import { BigLoader } from './loader/BigLoader';

import API from '../utils/API.js';
import utils from '../utils/utils';
import trans from '../translations/translate';

export class PublicRoute extends React.Component {

    constructor(props) {
        super(props);

        let file = trans.getFile();
        this.state = {
            trans   : file
        };
    }

    componentDidMount() {
        let _this = this;

        if (!this.state.trans){
            let locale = trans.getLocale();
            API.getTranslations(locale)
            .then(function(response){
                let translations = response.data.translations;
                trans.setFile(translations);
                _this.setState({trans : true});
                document.title = utils.generatePageTitle();
            }, function(error){
                _this.setState({trans : false});
            });
        }

    }

    render() {

        if (this.state.trans){
            return(<Route path={ this.props.path } component={ this.props.component }/>);
        } else if (this.state.trans === false){
            return( <Route><Redirect to='/user/sign' /></Route> );
        }

        return < BigLoader />;
    }

};