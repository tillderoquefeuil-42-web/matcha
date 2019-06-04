import React from 'react';
import { Button } from 'react-bootstrap';

import { Component } from '../Component';
import { Loader } from '../loader/Loader';

import { Sorting } from '../filter/Filter';
import { TagsInput } from '../tagsInput/TagsInput';
import { Distance, Age, Popularity } from '../matching/Inputs';
import { List } from '../matching/List';

import utils from '../../utils/utils';
import time from '../../utils/time';
import trans from '../../translations/translate';

import './search.css';

export class Search extends Component {

    constructor(props) {
        super(props);

        this.state = {
            matches     : null,
            match_id    : null,
            sorted      : null,
            options     : null,
        };

        this.socket = props._g.socket;
    }

    componentDidMount() {
        this._isMounted = true;

        document.title = utils.generatePageTitle(trans.get('PAGE_TITLE.SEARCH'));
        
        let _this = this;

        this.socket.off('LOAD_MATCHES').on('LOAD_MATCHES', function(data){
            _this.request = false;
            _this.updateMatches(data.matches);
        });

        this.socket.off('LOAD_ONE_MATCH').on('LOAD_ONE_MATCH', function(data){
            _this.updateOneMatch(data.match);
        });

    }

    updateMatches(data){
        let matches = utils.indexCollection(data);

        this.setState({
            matches : matches
        });
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

    handleSorting = sorted => {
        this.setState({sorted : sorted});

        if (this.$list){
            this.$list.resetIndex();
        }

    }

    handleFiltering = options => {
        this.setState({
            matches : null,
            options : options
        });

        if (this.request){
            return;
        }

        this.request = true;
        this.socket.emit('GET_MATCHES', {options:options});
    }

    buildSort() {

        if (!this.state.matches){
            return null;
        }

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

    getClasses() {
        let classes = 'search-matching';

        if (this.state.matches){
            classes += ' active';
        }

        return classes;
    }

    render() {

        return (
            <div id="search" className="container">

                <Filters
                    onFilter={ this.handleFiltering }
                    filters={ this.state.options }
                    _g={ this.props._g }
                    show
                />

                <div className={ this.getClasses() }>
                    { this.buildSort() }

                    <div className="clear-float" />

                    <div className="matching-profiles">
                        <List
                            ref={ el => this.$list = el }
                            matches={ this.state.matches }
                            sorted={ this.state.sorted }
                            _g={ this.props._g }
                        />
                    </div>
                </div>

            </div>
        );
    }
}

class Filters extends Component {

    constructor(props) {
        super(props);

        this.state = {
            active      : true,
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

    open = e => {
        this.setState({active : true});
    }

    close() {
        this.setState({active : false});
    }

    getClasses() {

        let classes = 'search-filters well';

        if (this.state.active){
            classes += ' active';
        }

        return classes;
    }

    render() {

        if (!this.state.distance){
            return (
                <div className="flex-center">
                    < Loader />
                </div>
            );
        }

        return (
            <div className={ this.getClasses() } >

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
                    onClick={ this.save }
                    block
                    bsSize="large"
                >
                    { trans.get('BUTTON.APPLY') }
                </Button>

                <i
                    className="fas fa-chevron-down fa-2x c-pointer"
                    onClick={ this.open }
                />

            </div>
        );
    }

}