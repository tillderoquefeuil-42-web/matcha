import React from 'react';

import { Component } from '../Component';

import { Loader } from '../loader/Loader';
import { Profile } from './Profile.js';
import { Connection } from './Connection.js';
import { Delete } from './Delete.js';
import { Picture } from './Picture.js';
import { UserLocation } from './UserLocation.js';
import { Search } from './Search.js';

import API from '../../utils/API';
import utils from '../../utils/utils.js';
import trans from '../../translations/translate';

import './user.css';

export class Account extends Component {

    constructor(props) {
        super(props);

        this.state = {
            user    : null,
        };
    }

    componentDidMount() {
        this._isMounted = true;
        document.title = utils.generatePageTitle(trans.get('PAGE_TITLE.ACCOUNT'));

        let _this = this;

        API.isAuth()
        .then(function(data){
            let user = data.data.user;
            utils.setLocalUser(user);
            _this.setState({
                user    : user
            });
        }, function(error){
            return;
        });

    }

    render() {

        if (!this.state.user){
            return (
                <div className="flex-center">
                    < Loader />
                </div>
            );
        }
        
        return (
            <div id="account" className="container">

                <div className="col-md-6">
                    <Profile />
                    <Search _g={ this.props._g } />
                    <Connection />
                </div>

                <div className="col-md-6">
                    <UserLocation />
                    <Picture _g={ this.props._g } />
                    <Delete />
                </div>

            </div>
        );
    }
}