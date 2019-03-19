import React from 'react';
import { Button } from 'react-bootstrap';

import { Component } from '../Component';
// import { Distance, Age, Popularity } from '../matching/Inputs';
import { Distance, Age } from '../matching/Inputs';

import API from '../../utils/API';
import time from '../../utils/time';
import trans from '../../translations/translate';

export class Search extends Component {

    constructor(props) {
        super(props);

        this.state = {
            distance    : null,
            age         : null,
            popularity  : null
        };

        this.socket = props._g.socket;
    }

    componentDidMount() {
        this._isMounted = true;

        let _this = this;

        this.socket.off('LOAD_SEARCH_PARAMS').on('LOAD_SEARCH_PARAMS', function(data){
            if (data){
                _this.updateSearchParams(data);
            }
        });

        this.socket.off('UPDATE_SEARCH_PARAMS').on('UPDATE_SEARCH_PARAMS', function(data){
            API.catchSuccess();
        });

        this.socket.emit('GET_SEARCH_PARAMS');
    }


    // SETTERS

    updateSearchParams(data) {
        this.setState({
            distance    : data.distance,
            age         : [time.getAgeFromDatetime(data.age_min), time.getAgeFromDatetime(data.age_max)]
        });
    }

    setParam = (param, label) => {
        this.setState({[label] : param});
    }


    parseInputData() {
        let inputs = ['distance', 'age', 'popularity'];

        let data = {};

        for (let i in inputs){
            let label = inputs[i];
            let value = this.state[label];

            if (value && value.length === 2){
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

    // SAVER

    saveSearchParams = event => {

        let data = this.parseInputData();
        this.parseAges(data);

        this.socket.emit('SET_SEARCH_PARAMS', data);
    }


    render() {

        return(

            <div id="search-params" className="account-block" >
                <h2 className="form-section">{ trans.get('MATCHING.PARAMS') }</h2>

                <Distance
                    value={ this.state.distance }
                    onChange={ (param) => this.setParam(param, 'distance') }
                />

                <Age
                    value={ this.state.age }
                    onChange={ (param) => this.setParam(param, 'age') }
                />

                {/*<Popularity
                    value={ this.state.popularity }
                    onChange={ (param) => this.setParam(param, 'popularity') }
                />*/}

                <hr />

                <Button
                    onClick={this.saveSearchParams}
                    block
                    bsStyle="primary"
                    bsSize="large"
                >
                    { trans.get('BUTTON.SAVE') }
                </Button>
            </div>
        );
    }
}
