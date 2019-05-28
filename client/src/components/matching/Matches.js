import React from 'react';

import { Component } from '../Component';
import { Loader } from '../loader/Loader';
import { SearchBar } from '../searchBar/SearchBar';

import { OneProfile } from './Inputs';

import utils from '../../utils/utils.js';
import trans from '../../translations/translate';

import './matching.css';

export class Matches extends Component {

    constructor(props) {
        super(props);

        this.state = {
            matched : null
        };

        this.socket = props._g.socket;
    }

    componentDidMount() {
        this._isMounted = true;

        document.title = utils.generatePageTitle(trans.get('PAGE_TITLE.MATCHED'));

        let _this = this;

        this.socket.off('LOAD_MATCHED').on('LOAD_MATCHED', function(data){
            _this.updateMatched(data.matched);
        });

        this.socket.off('LOAD_ONE_MATCH').on('LOAD_ONE_MATCH', function(data){
            _this.updateOneMatch(data.match);
        });

        this.socket.emit('GET_MATCHED');
        this.socket.emit('GET_CONTACTS');
    }

    componentDidUpdate() {
        if (this.state.matched !== null){
            this.searchBar.updateCollection(this.state.matched);
        }
    }

    updateMatched(data){
        let matched = utils.indexCollection(data);

        this.setState({
            matched : matched
        });
    }

    updateOneMatch(match){
        let matches = this.state.matched;

        if (typeof match === 'object'){
            if (match.match_relation && match.match_relation.p_has_liked && match.match_relation.u_has_liked){
                matches[match._id] = match;
            } else {
                delete matches[match._id];
            }
        } else if (typeof match === 'number'){
            delete matches[match];
        }

        this.updateMatched(matches);
    }

    createSearchBar() {

        return (
            <div className="matched-searchbar-container">
                <SearchBar
                    ref={ $element => this.searchBar = $element }
                    collection={ this.state.matched }
                    onSelect={(event, item) => this.handleSelect(event, item)}
                    getLabel={ function(item){ return (item.firstname + ' ' + item.lastname); } }
                    renderItem={ this.renderOneMatch }
                    defaultOpen
                    resetValue
                    autofocus
                />
            </div>
        );
    }

    renderOneMatch(match) {
        return (
            <OneProfile
                match={ match }
                onSelect={ () => null }
            />
        );
    }

    handleSelect = (e, item) => {
        if (!item || !utils.isDefine(item._id)){
            return;
        }

        utils.getExtendedProfile(this.socket, {
            partner_id  : item._id,
            contact     : true
        });
    }

    render() {

        if (!this.state.matched){
            return (
                <div className="flex-center">
                    < Loader />
                </div>
            );
        }

        return (
            <div id="matched" className="container">
                { this.createSearchBar() }
            </div>
        );
    }

}