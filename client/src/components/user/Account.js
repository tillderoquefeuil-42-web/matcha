import React from 'react';

import { Loader } from '../loader/Loader';
import { Profile } from './Profile.js';
import { Connection } from './Connection.js';
import { Delete } from './Delete.js';
import { Picture } from './Picture.js';
import { UserLocation } from './UserLocation.js';

import API from '../../utils/API';
import utils from '../../utils/utils.js';
import trans from '../../translations/translate';

import './user.css';

export class Account extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            user    : null,
        };
    }

    componentDidMount() {
        let _this = this;
        document.title = utils.generatePageTitle(trans.get('PAGE_TITLE.ACCOUNT'));

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
                </div>

                <div className="col-md-6">
                    <UserLocation />
                </div>

                <div className="col-md-6">
                    <Picture _g={ this.props._g } />
                </div>

                <div className="clearfix" />

                <div className="col-md-6">
                    <Connection />
                </div>

                <div className="col-md-6">
                    <Delete />
                </div>

            </div>
        );
    }
}