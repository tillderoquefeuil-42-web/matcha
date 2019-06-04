import React from 'react';

import { Component } from '../Component';
import { OneProfile } from './Inputs';

import utils from '../../utils/utils';

import './matching.css';

export class List extends Component {

    constructor(props) {
        super(props);

        this.state = {
            index       : 0,
            match_id    : null
        };

        this.socket = props._g.socket;
    }

    resetIndex() {
        this.setState({index : 0});
    }

    maxProfilesPage() {
        let nb = window.innerWidth / 500;
        nb = Math.ceil(nb);

        return (nb > 4? 4 : nb);
    }

    getSortedMatches() {
        let sorted = this.props.sorted;
        let matches = this.props.matches;

        let data = [];

        for (let i in sorted){
            data.push(matches[sorted[i]]);
        }

        return data;
    }

    buildMatches(){

        let elems = [];
        let count = this.state.index;
        let matches = this.getSortedMatches();

        if (!matches || !matches.length){
            return null;
        }

        let length = matches.length;

        if (length > this.maxProfilesPage()){
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
        while (j++ < this.maxProfilesPage()){
            if (j > length){
                break;
            }
            if (!matches[count]){
                count = 0;
            }

            elems.push(
                <OneProfile
                    key={ j }
                    match={ matches[count] }
                    onSelect={ (matchId) => this.selectOneProfile(matchId) }
                />
            );
            count++;
        }

        if (length > this.maxProfilesPage()){
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

        let index = this.state.index;
        let matches = Object.values(this.props.matches);
        let length = matches.length;

        if (event.target.id === 'last-profiles'){
            index = index - this.maxProfilesPage();
            index = (index < 0)? index + length : index;
        } else if (event.target.id === 'next-profiles'){
            index = index + this.maxProfilesPage();
            index = (index >= length)? index - length : index;
        }

        this.setState({index : index});
    }

    selectOneProfile(matchId) {
        if (matchId === null){
            return null;
        }

        utils.getExtendedProfile(this.socket, matchId);
        return;
    }

    render() {

        if (!this.props.matches){
            return null;
        }

        return (
            <div className="matching-list">
                { this.buildMatches() }
            </div>
        );
    }
}