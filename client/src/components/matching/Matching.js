import React from 'react';

import { Component } from '../Component';
import { Loader } from '../loader/Loader';
import { SuperModal } from '../modal/CustomModal';
import { TagsInput } from '../tagsInput/TagsInput';
import { OneFileView } from '../images/Dropzone';
import { Sorting } from '../filter/Filter';

import utils from '../../utils/utils.js';
import trans from '../../translations/translate';

import './matching.css';

const maxProfilesPage = 3;


export class Matching extends Component {

    constructor(props) {
        super(props);

        this.state = {
            matches     : null,
            match       : null,
            sorted      : null,
            index       : 0
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

    selectOneProfile(_id) {
        let matches = this.state.matches;
        if (matches && matches[_id]){
            console.log(matches[_id]);
            this.setState({match : matches[_id]});
        }
    }

    updateMatches(data){
        let matches = utils.indexCollection(data);

        this.setState({
            matches : matches
        });

        console.warn('Globale variable to delete');
        window.matches = matches;
    }

    buildSort() {

        let sorts = [{
                inverse : true,
                value   : 'pertinence',
                label   : trans.get('COMMON.PERTINENCE')
            }, {
                inverse : true,
                value   : 'birthday',
                label   : trans.get('USER.FIELDS.AGE')
            }, {
                value   : 'distance',
                label   : trans.get('USER.FIELDS.DISTANCE')
            }, {
                inverse : true,
                value   : 'common_tags',
                label   : trans.get('USER.FIELDS.COMMON_INTERESTS')
            }
        ];

        return (
            <Sorting
                collection={ this.state.matches }
                onSort={ (c) => this.handleSorting(c) }
                defaultValue={ 0 }
                sorts={ sorts }
            />
        );
    }

    handleSorting = matches => {
        this.setState({
            sorted  : matches,
            index   : 0
        });
    }

    buildMatches(){

        let elems = [];
        let count = this.state.index;
        let matches = this.state.sorted;

        if (!matches || !matches.length){
            return null;
        }

        elems.push(
            <i
                key="last"
                id="last-profiles"
                className="fas fa-caret-left"
                onClick={ this.changePageProfiles }
            ></i>
        );

        let j = 0;
        while (j++ < maxProfilesPage){
            if (!matches[count]){
                count = 0;
            }

            elems.push(this.buildOneProfile(matches[count], j));
            count++;
        }

        elems.push(
            <i
                key="next"
                id="next-profiles"
                className="fas fa-caret-right"
                onClick={ this.changePageProfiles }
            ></i>
        );

        return elems;
    }

    buildOneProfile(match, j) {

        if (!match){
            return null;
        }

        return (
            <div
                key={ j }
                className="one-profile"
                onClick={ () => this.selectOneProfile(match._id) }
            >

                <div className="profile-pic">
                    <img src={ utils.getFileUrl(match.profile_pic) } alt="" />
                </div>

                <h1>{ match.firstname }</h1>
                <span>{ match.age }</span>
            </div>
        );
    }

    changePageProfiles = event => {

        let index = this.state.index;
        let matches = Object.values(this.state.matches);
        let length = matches.length;

        if (event.target.id === 'last-profiles'){
            index = index - maxProfilesPage;
            index = (index < 0)? index + length : index;
        } else if (event.target.id === 'next-profiles'){
            index = index + maxProfilesPage;
            index = (index >= length)? index - length : index;
        }

        this.setState({index : index});
    }

    showExtendedProfile() {
        if (this.state.match === null){
            return null;
        }

        return true;
    }

    closeExtendedProfile() {
        this.setState({match : null});
        utils.resetPicturesDisplay();
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

                <ExtendedProfile
                    show={ this.showExtendedProfile() }
                    onClose={ () => this.closeExtendedProfile() }
                    match={ this.state.match }
                    keyboard={ false }
                />

                <div className="matching-sorting">
                    { this.buildSort() }
                </div>

                <div className="matching-profiles">
                    { this.buildMatches() }
                </div>
            </div>
        );
    }
}

class ExtendedProfile extends SuperModal {

    componentDidMount() {
        this._isMounted = true;
        this.header = false;
        this.footer = false;
    }

    componentDidUpdate() {
        if (this.props.show){
            document.addEventListener("keyup", this.handleExtendedKeyPress);
        } else {
            document.removeEventListener("keyup", this.handleExtendedKeyPress);
        }
    }

    handleExtendedKeyPress = e => {
        let arrows = ['Escape'];

        if (!this.props.show || arrows.indexOf(e.key) === -1){
            return;
        }

        this.props.onClose();
    }


    getDistance(match) {
        return Math.round(match.distance / 1000);
    }

    getBasicsInfos(match){
        let basics = match.age + trans.get('UNITS.AGE');
        basics += ' | ';
        basics += this.getDistance(match) + trans.get('UNITS.KM');

        return basics;
    }

    buildFile() {

        let match = this.props.match;
        if (match){
            return <img src={ utils.getFileUrl(match.profile_pic) } alt="" />
        }

        return null;
    }

    buildFiles() {
        let match = this.props.match;
        if (!match){
            return null;
        }

        let data = [];
        for (let i in match.pictures){
            data.push(
                <OneFileView
                    file={ match.pictures[i] }
                    key={ i }
                    multi
                />
            );
        }

        return data;
    }

    buildInfos() {
        let match = this.props.match;
        if (!match){
            return null;
        }

        return (
            <div className="profile-infos-display">
                <div>
                    <p className="profile-identity">
                        <b>{ match.firstname }</b>
                        <span>{ this.getBasicsInfos(match) }</span>
                    </p>

                    <TagsInput
                        tags={ match.tags }
                        readOnly
                    />

                    <p className="profile-bio">
                        { match.bio }
                    </p>
                </div>

                <div className="profile-pictures">
                    { this.buildFiles() }
                </div>

            </div>
        );
    }

    buildClose() {

        return (
            <span className="close-extended-profile" onClick={ () => this.props.onClose() }>
                <i className="fa fa-times"></i>
            </span>
        );
    }

    buildbody() {

        return(
            <div id="extended-profile">
                { this.buildClose() }

                <div className="profile-pic">
                    { this.buildFile() }
                </div>

                <div className="profile-info">
                    { this.buildInfos() }
                </div>

            </div>
        );
    }

}