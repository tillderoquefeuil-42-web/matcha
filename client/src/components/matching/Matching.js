import React from 'react';
import { Button } from 'react-bootstrap';

import { Component } from '../Component';
import { Loader } from '../loader/Loader';
import { SuperModal } from '../modal/CustomModal';
import { TagsInput } from '../tagsInput/TagsInput';
import { OneFileView } from '../images/Dropzone';
import { Sorting } from '../filter/Filter';
import { ProgressCircle } from '../progressCircle/ProgressCircle';
import { Distance, Age } from '../matching/Inputs';

import utils from '../../utils/utils.js';
import time from '../../utils/time';
import trans from '../../translations/translate';

import './matching.css';

const maxProfilesPage = 3;


export class Matching extends Component {

    constructor(props) {
        super(props);

        this.state = {
            index       : 0,
            matches     : null,
            match_id    : null,
            sorted      : null,
            options     : null,
            showFilters : false
        };

        this.socket = props._g.socket;
    }

    componentDidMount() {
        this._isMounted = true;

        document.title = utils.generatePageTitle(trans.get('PAGE_TITLE.MATCH'));

        let _this = this;

        this.socket.off('LOAD_MATCHES').on('LOAD_MATCHES', function(data){
            _this.updateMatches(data.matches);
        });

        this.socket.off('LOAD_ONE_MATCH').on('LOAD_ONE_MATCH', function(data){
            _this.updateOneMatch(data.match);
        });

        this.socket.emit('GET_MATCHES');
    }

    selectOneProfile(_id) {
        let matches = this.state.matches;
        if (matches && matches[_id]){
            this.setState({match_id : _id});
        }
    }

    updateOneMatch(match){
        let matches = this.state.matches;

        if (typeof match === 'object'){
            matches[match._id] = match;
        } else if (typeof match === 'number'){
            this.reindexSorted(match);
            delete matches[match];
        }

        this.updateMatches(matches);
    }

    reindexSorted(match){
        let sorted = this.state.sorted;
        let index = sorted.indexOf(match);
        if (index === -1){
            return;
        }

        sorted[index] = null;
        sorted = sorted.filter(function (el) {
            return el != null;
        });

        this.setState({sorted:sorted});
    }

    updateMatches(data){
        let matches = utils.indexCollection(data);

        this.setState({
            matches : matches
        });

        if (!this.log_warning){
            console.warn('Globale variable to delete');
            this.log_warning = true;
        }
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

    buildFilters(){

        if (this.state.showFilters){
            return (<div />);
        }

        return (
            <Button
                onClick={ (e) => this.toggleFilters(e, true) }
            >
                <i className="fas fa-filter"></i>
            </Button>
        );
    }

    toggleFilters = (e, force) => {
        let showFilters = (force === false || force === true)? force : (!this.state.showFilters);

        this.setState({showFilters:showFilters});
    }

    handleSorting = sorted => {
        this.setState({
            sorted  : sorted,
            index   : 0
        });
    }

    handleFiltering = options => {
        this.setState({
            matches : null,
            options : options
        });

        this.socket.emit('GET_MATCHES', {options:options});
    }

    getSortedMatches() {
        let sorted = this.state.sorted;
        let matches = this.state.matches;

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

        if (length > maxProfilesPage){
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
            if (j > length){
                break;
            }
            if (!matches[count]){
                count = 0;
            }

            elems.push(this.buildOneProfile(matches[count], j));
            count++;
        }

        if (length > maxProfilesPage){
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
        if (this.state.match_id === null){
            return null;
        }

        return true;
    }

    closeExtendedProfile() {
        let matches = this.state.matches;
        let match = matches[this.state.match_id];

        if (match.match_relation && match.match_relation.p_has_liked && match.match_relation.u_has_liked){
            delete matches[this.state.match_id];
        }

        this.setState({
            matches     : matches,
            match_id    : null
        });

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
                <Filters
                    show={ this.state.showFilters }
                    onClose={ (e) => this.toggleFilters(e, false) }
                    onFilter={ this.handleFiltering }
                    filters={ this.state.options }
                    _g={ this.props._g }
                />

                <ExtendedProfile
                    show={ this.showExtendedProfile() }
                    onClose={ () => this.closeExtendedProfile() }
                    match={ this.state.matches[this.state.match_id] }
                    keyboard={ false }
                    _g={ this.props._g }
                />

                <div className="matching-sorting">
                    { this.buildFilters() }
                    { this.buildSort() }
                </div>

                <div className="matching-profiles">
                    { this.buildMatches() }
                </div>
            </div>
        );
    }
}

class Filters extends Component {

    constructor(props) {
        super(props);

        this.state = {
            distance    : null,
            age         : null,
            tags        : null
        };

        this.socket = props._g.socket;
    }

    componentDidMount() {
        this._isMounted = true;

        let _this = this;

        if (this.props.filters){
            _this.updateSearchParams(this.props.filters);
            return;
        }

        this.socket.off('LOAD_SEARCH_PARAMS').on('LOAD_SEARCH_PARAMS', function(data){
            if (data){
                _this.updateSearchParams(data);
            }
        });

        this.socket.emit('GET_SEARCH_PARAMS');
    }

    // SETTERS
    updateSearchParams(data) {
        this.setState({
            distance    : data.distance,
            age         : [time.getAgeFromDatetime(data.age_min), time.getAgeFromDatetime(data.age_max)],
            tags        : data.tags
        });
    }

    setParam = (param, label) => {
        this.setState({[label] : param});
    }

    // PARSE & SAVE
    parseInputData() {
        let inputs = ['distance', 'age', 'tags'];

        let data = {};

        for (let i in inputs){
            let label = inputs[i];
            let value = this.state[label];

            if (value && value.length === 2 && label !== 'tags'){
                data[label+'_min'] = value[0];
                data[label+'_max'] = value[1];
            } else {
                data[label] = value;
            }
        }

        return data;
    }

    parseAges(data) {
        data.age_min = time.ageToDatetime(data.age_min);

        let max = time.getDateFromAge(data.age_max);
        max.setDate(1);
        max.setMonth(0);
        data.age_max = time.toDatetime(max);

        return data;
    }

    save = e => {
        let data = this.parseInputData();

        this.parseAges(data);

        this.props.onFilter(data);
        this.close();
    }

    upTo(element, oneClass) {
        while (element && element.parentNode) {
            if (element.className && element.className.split(' ').indexOf(oneClass) !== -1) {
                return element;
            }

            element = element.parentNode;
        }
        return null;
    }

    handleMouseDown = event => {
        if (!this.upTo(event.toElement, 'matching-filters')){
            this.close();
        }
    }

    close() {
        document.removeEventListener('mousedown', this.handleMouseDown);
        this.props.onClose();
    }

    render() {

        document.removeEventListener('mousedown', this.handleMouseDown);
        if (!this.props.show){
            return null;
        }

        document.addEventListener('mousedown', this.handleMouseDown);

        return (
            <div className="matching-filters">

                <span className="close-matching-filters" onClick={ () => this.close() }>
                    <i className="fa fa-times"></i>
                </span>

                <Distance
                    value={ this.state.distance }
                    onChange={ (param) => this.setParam(param, 'distance') }
                />

                <Age
                    value={ this.state.age }
                    onChange={ (param) => this.setParam(param, 'age') }
                />

                <TagsInput
                    tags={ this.state.tags }
                    onChange={(value) => this.setParam(value, 'tags')}
                />


                <Button
                    onClick={this.save}
                    block
                    bsSize="large"
                >
                    { trans.get('BUTTON.APPLY') }
                </Button>

            </div>
        );
    }

}

class ExtendedProfile extends SuperModal {

    componentDidMount() {
        this._isMounted = true;
        this.header = false;
        this.footer = false;

        this.socket = this.props._g.socket;
    }

    componentDidUpdate() {
        if (this.props.show){
            document.addEventListener("keyup", this.handleExtendedKeyPress);
            this.updateMatchRelation();
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

    handleLike = e => {
        let liked = (!this.hasLiked());

        let data = {
            like        : liked,
            partner_id  : this.props.match._id
        }

        this.socket.emit('UPDATE_LIKE_STATE', data);
    }

    handleBlock = e => {
        let data = {
            partner_id  : this.props.match._id
        }

        this.socket.emit('BLOCK_MATCH_RELATION', data);
        this.props.onClose();
    }

    handleReport = e => {
        let data = {
            partner_id  : this.props.match._id
        }

        if (window.confirm(trans.get('USER.DISCLAIMER.REPORT'))){
            this.socket.emit('REPORT_MATCH_RELATION', data);
            this.props.onClose();
        }
    }

    updateMatchRelation() {
        let partner = this.props.match;
        let partner_id = partner._id;

        if (!partner || (partner.match_relation && partner.match_relation.p_has_seen)){
            return;
        }

        let data = {
            partner_id  : partner_id
        }

        this.socket.emit('UPDATE_MATCH_RELATION', data);
    }

    hasLiked() {
        let partner = this.props.match;

        if (partner && partner.match_relation && partner.match_relation.p_has_liked){
            return true;
        }

        return false;
    }

    hasBeenLiked() {
        let partner = this.props.match;

        if (partner && partner.match_relation && partner.match_relation.u_has_liked){
            return true;
        }

        return false;
    }

    getAge(match) {
        return (
            <span>
                { match.age + trans.get('UNITS.AGE') }
            </span>
        );
    }

    getDistance(match) {
        let distance = Math.round(match.distance / 1000);
        if (!distance){
            distance = '<1'
        }

        distance += trans.get('UNITS.KM');

        return (
            <span>
                | { distance }
            </span>
        );
    }

    getRate(match) {
        if (!match.rate){
            return;
        }

        return (
            <span title={ trans.get('USER.FIELDS.POPULARITY') + ` (${match.rate}%)` }>
                | <ProgressCircle value={ match.rate } small/>
            </span>
        );
    }

    getBasicsInfos(match){
        return (
            <span>
                { this.getAge(match) }
                { this.getDistance(match) }
                { this.getRate(match) }
            </span>
        );
    }

    getDotsList(){
        return ([
            {
                label   : trans.get('USER.FIELDS.BLOCK'),
                onClick : this.handleBlock
            },
            {
                label   : trans.get('USER.FIELDS.REPORT'),
                onClick : this.handleReport
            }
        ]);
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

                    <div className="icons-container">
                        <LikeIcon
                            hasLiked={ this.hasLiked() }
                            hasBeenLiked={ this.hasBeenLiked() }
                            onClick={ this.handleLike }
                        />

                        <DotsIcon
                            list={ this.getDotsList() }
                        />
                    </div>

                    <div className="profile-identity">
                        <b>{ match.firstname }</b>
                        { this.getBasicsInfos(match) }
                    </div>

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
        return null;
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

class LikeIcon extends Component {

    hasLiked() {
        let classes = 'left-half vertical-split';

        if (this.props.hasLiked){
            classes += ' active'
        }
        return classes;
    }

    hasBeenLiked() {
        let classes = 'right-half vertical-split';

        if (this.props.hasBeenLiked){
            classes += ' active'
        }
        return classes;
    }

    render() {
        return (
            <div className="like-icon">
                <div className={ this.hasLiked() } onClick={ this.props.onClick } title={ trans.get('USER.FIELDS.LIKE') }>
                    <div className="top-half horizontal-split">
                        <i className="far fa-heart"></i>
                    </div>
                    <div className="bottom-half horizontal-split">
                        <i className="far fa-heart"></i>
                    </div>
                </div>
                <div className={ this.hasBeenLiked() } title={ trans.get('USER.FIELDS.BEEN_LIKE') }>
                    <div className="top-half horizontal-split">
                        <i className="far fa-heart"></i>
                    </div>
                    <div className="bottom-half horizontal-split">
                        <i className="far fa-heart"></i>
                    </div>
                </div>
            </div>
        );
    }

}

class DotsIcon extends Component {

    constructor(props){
        super(props);

        this.state = {
            show    : false
        };
    }

    toggleShow = e => {
        this.setState({show:(!this.state.show)});
    }

    getClasses() {
        let classes = 'dots-menu';

        if (!this.state.show){
            classes += ' no-display';
        }

        return classes;
    }

    buildList() {
        let list = [];

        let elements = this.props.list;
        for (let i in elements){
            let elem = elements[i];
            list.push(
                <li
                    key={ i }
                    onClick={ elem.onClick }
                >
                    { elem.label }
                </li>
            );
        }

        return list;
    }

    upTo(element, oneClass) {
        while (element && element.parentNode) {
            if (element.className && element.className.split(' ').indexOf(oneClass) !== -1) {
                return element;
            }

            element = element.parentNode;
        }
        return null;
    }

    handleMouseDown = event => {
        if (this.state.show && !this.upTo(event.toElement, 'dots-menu')){
            this.toggleShow();
        }
    }

    render() {

        document.removeEventListener('mousedown', this.handleMouseDown);
        if (this.state.show){
            document.addEventListener('mousedown', this.handleMouseDown);
        }

        return (
            <div className="dots-icon" onClick={ this.toggleShow } >
                <i className="fas fa-ellipsis-v"></i>
                <div className={ this.getClasses() }>
                    <ul>
                        { this.buildList() }
                    </ul>
                </div>
            </div>
        );
    }
}
