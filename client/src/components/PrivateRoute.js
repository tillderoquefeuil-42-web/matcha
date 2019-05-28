
import React from 'react';
import { Route, Redirect } from 'react-router-dom';

import { Component } from './Component';
import { Layout } from './layout/Layout';
import { BigLoader } from './loader/BigLoader';

import API from '../utils/API.js';
import utils from '../utils/utils';
import trans from '../translations/translate';

export class PrivateRoute extends Component {

    constructor(props) {
        super(props);

        let params = utils.getQueryParameters(props);
        let token = params.get('token');

        // let file = trans.getFile();
        let file = null;
        let user = utils.getLocalUser();

        this.state = {
            token   : token,
            trans   : file,
            user    : user,
            params  : params
        };
    }

    componentDidMount() {
        this._isMounted = true;
        let _this = this;

        if (this.state.token){
            localStorage.setItem('token', this.state.token);
        }

        if (!this.state.user){
            this.updateUser();
        }

        if (!this.state.trans){
            this.updateTranslations();
        } else {
            document.title = utils.generatePageTitle();
        }

        document.addEventListener('maj_display', function (e) {
            let user = utils.getLocalUser();
            _this.setState({
                user    : user
            });
        }, false);

    }

    updateUser() {
        let _this = this;

        return API.isAuth()
        .then(function(data){
            let user = data.data.user;
            utils.setLocalUser(user);
            trans.setLocale(user.language, true);
            _this.setState({user : user});
        }, function(error){
            _this.setState({user : false});
        });
    }

    updateTranslations(){
        let _this = this;
        let locale = trans.getLocale();

        return API.getTranslations(locale)
        .then(function(response){
            let translations = response.data.translations;
            trans.setFile(translations);
            _this.setState({trans : true});
            if (!document.title){
                document.title = utils.generatePageTitle();
            }
        }, function(error){
            _this.setState({trans : false});
        });
    }

    render() {

        if (this.state.user && this.state.trans){
            return(<Layout page={ this.props.page } user={ this.state.user } params={ this.state.params }/>);
        } else if (this.state.user === false || this.state.trans === false){
            return( <Route><Redirect to='/user/sign' /></Route> );
        }

        return < BigLoader />;
    }

};