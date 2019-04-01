import React from 'react';

import { Component } from '../Component';
import { Loader } from '../loader/Loader';
import { SearchBar } from '../searchBar/SearchBar';

import { ExtendedProfile, OneProfile } from './Inputs';

import utils from '../../utils/utils.js';
import trans from '../../translations/translate';

import './matching.css';

export class Matches extends Component {

    constructor(props) {
        super(props);

        this.state = {
            matched     : null,
            match_id    : null
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

        this.socket.emit('GET_MATCHED');
    }

    updateMatched(data){
        let matched = utils.indexCollection(data);

        this.setState({
            matched : matched
        });

        if (!this.log_warning){
            console.warn('Globale variable to delete');
            this.log_warning = true;
        }
        window.matched = matched;
    }

    createSearchBar() {

        return (
            <div className="matched-searchbar-container">
                <SearchBar
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
        this.setState({match_id : item._id});
    }

    showExtendedProfile() {
        if (this.state.match_id === null){
            return null;
        }

        return true;
    }

    closeExtendedProfile() {
        this.setState({
            match_id    : null
        });

        utils.resetPicturesDisplay();
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

                <ExtendedProfile
                    show={ this.showExtendedProfile() }
                    onClose={ () => this.closeExtendedProfile() }
                    match={ this.state.matched[this.state.match_id] }
                    keyboard={ false }
                    _g={ this.props._g }
                    contact
                />

                { this.createSearchBar() }
            </div>
        );
    }

}