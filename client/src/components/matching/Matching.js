import React from 'react';

import { Component } from '../Component';
import { Loader } from '../loader/Loader';

import utils from '../../utils/utils.js';
import time from '../../utils/time';
import trans from '../../translations/translate';

import './matching.css';

const maxProfilesPage = 3;


function getFileUrl(file) {
    let token = (localStorage.getItem('token')? localStorage.getItem('token') : "");
    let url = `http://localhost:8000/file/private?_t=${token}&filename=${file.filename}`;

    return url;
}

export class Matching extends Component {

    constructor(props) {
        super(props);

        this.state = {
            matches : null,
            page    : 0
        };

        this.socket = props._g.socket;
    }

    componentDidMount() {
        this._isMounted = true;

        document.title = utils.generatePageTitle(trans.get('PAGE_TITLE.MATCH'));

        let _this = this;

        this.socket.on('LOAD_MATCHES', function(data){
            _this.updateMatches(data.matches);
        });

        this.socket.emit('GET_MATCHES');
    }

    updateMatches(matches){
        console.log(matches);

        this.setState({
            matches : utils.indexCollection(matches)
        });
    }

    buildMatches(){

        let elems = [];
        let matches = Object.values(this.state.matches);
        let page = this.state.page;

        let count = page * maxProfilesPage;

        if (page > 0){
            elems.push(
                <i
                    key="last"
                    id="last-profiles"
                    className="fas fa-caret-left"
                    onClick={ this.changePageProfiles }
                ></i>
            );
        }

        let j = 0;
        while (j++ < maxProfilesPage){
            if (!matches[count]){
                break;
            }

            elems.push(
                <OneProfile key={j} match={ matches[count] }/>
            );
            count++;
        }

        if (matches.length > maxProfilesPage * (page+1)){
            elems.push(
                <i
                    key="next"
                    id="next-profiles"
                    className="fas fa-caret-right"
                    onClick={ this.changePageProfiles }
                ></i>
            );
        }

        return elems;
    }

    changePageProfiles = event => {
        if (event.target.id === 'last-profiles'){
            this.setState({page : this.state.page-1});
        } else if (event.target.id === 'next-profiles'){
            this.setState({page : this.state.page+1});
        }
    }

    render() {

        if (!this.state.matches){
            return (
                <div className="flex-center">
                    < Loader />
                </div>
            );
        }
        
        return (
            <div id="matching" className="container">
                <div className="matching-profiles">
                    { this.buildMatches() }
                </div>
            </div>
        );
    }
}

class OneProfile extends Component {

    getAge() {
        let match = this.props.match;
        return time.getAgeFromTime(match.birthday);
    }

    render() {

        return (
            <div className="one-profile">

                <div className="profile-pic">
                    <img src={ getFileUrl(this.props.match.profile_pic) } alt="" />
                </div>

                <h1>{ this.props.match.firstname }</h1>
                <span>{ this.getAge() }</span>
            </div>
        );

    }

}