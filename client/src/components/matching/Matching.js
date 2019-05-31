import React from 'react';
import { Button } from 'react-bootstrap';

import { Component } from '../Component';
import { Loader } from '../loader/Loader';

import { Sorting } from '../filter/Filter';
import { TagsInput } from '../tagsInput/TagsInput';
import { List } from './List';
import { Distance, Age, Popularity } from './Inputs';

import utils from '../../utils/utils.js';
import time from '../../utils/time';
import trans from '../../translations/translate';

import './matching.css';

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

    selectOneProfile(matchId) {
        if (matchId === null){
            return null;
        }

        utils.getExtendedProfile(this.socket, matchId);
        return;
    }

    updateOneMatch(match){
        let matches = this.state.matches;

        if (typeof match === 'object'){
            if (match.match_relation && match.match_relation.p_has_liked && match.match_relation.u_has_liked){
                delete matches[match._id];
            } else {
                matches[match._id] = match;
            }
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
    }

    buildSort() {

        let sorts = [{
                inverse : true,
                value   : 'pertinence',
                label   : trans.get('COMMON.PERTINENCE')
            }, {
                inverse : true,
                value   : 'age',
                label   : trans.get('USER.FIELDS.AGE')
            }, {
                value   : 'distance',
                label   : trans.get('USER.FIELDS.DISTANCE')
            }, {
                inverse : true,
                value   : 'common_tags',
                label   : trans.get('USER.FIELDS.COMMON_INTERESTS')
            }, {
                inverse : true,
                value   : 'rate',
                label   : trans.get('USER.FIELDS.POPULARITY')
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

                <div className="matching-sorting">
                    { this.buildFilters() }
                    { this.buildSort() }
                </div>

                <div className="matching-profiles">
                    <List
                        matches={ this.state.matches }
                        sorted={ this.state.sorted }
                        _g={ this.props._g }
                    />
                </div>
            </div>
        );
    }
}

class Filters extends Component {

    constructor(props) {
        super(props);

        this.state = {
            rate        : null,
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
            rate        : [data.rate_min, data.rate_max],
            age         : [time.getAgeFromDatetime(data.age_min), time.getAgeFromDatetime(data.age_max)],
            tags        : data.tags
        });
    }

    setParam = (param, label) => {
        this.setState({[label] : param});
    }

    // PARSE & SAVE
    parseInputData() {
        let inputs = ['distance', 'age', 'rate', 'tags'];

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

    handleMouseDown = event => {
        if (!utils.upTo(event.toElement, 'matching-filters')){
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

                <Popularity
                    value={ this.state.rate }
                    onChange={ (param) => this.setParam(param, 'rate') }
                />

                <TagsInput
                    tags={ this.state.tags }
                    onChange={ (value) => this.setParam(value, 'tags') }
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