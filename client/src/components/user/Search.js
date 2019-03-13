import React from 'react';
import { Button } from 'react-bootstrap';

import { Component } from '../Component';
// import { Distance, Age, Popularity } from '../matching/Inputs';
import { Distance, Age } from '../matching/Inputs';

import API from '../../utils/API';
import time from '../../utils/time';
import trans from '../../translations/translate';

const distanceUnit = trans.get('UNITS.KM');

const defaultParams = {
    distance    : {
        default : 50,
        min     : 1,
        max     : 250,
        marks   : {
            1   : <strong>{ 1 + distanceUnit }</strong>,
            50 : '50' + distanceUnit,
            100 : '100' + distanceUnit,
            150 : '150' + distanceUnit,
            200 : '200' + distanceUnit,
            250 : <strong>{ 250 + distanceUnit }</strong>
        },
    },
    age         : {
        min     : 16,
        max     : 100,
        marks   : {
            18  : <strong>18</strong>,
            25  : '25',
            40  : '40',
            55  : '55',
            70  : '70',
            85  : '85',
            99  : <strong>99</strong>
        },
    },
    popularity  : {
        min     : 0,
        max     : 5,
        marks   : {
            0   : '0',
            1   : '1',
            2   : '2',
            3   : '3',
            4   : '4',
            5   : '5',
        },
    }
}

export class Search extends Component {

    constructor(props) {
        super(props);

        this.state = {
            distance    : defaultParams.distance.default,
            age         : [defaultParams.age.min, defaultParams.age.max],
            popularity  : [defaultParams.popularity.min, defaultParams.popularity.max]
        };

        this.socket = props._g.socket;
    }

    componentDidMount() {
        this._isMounted = true;

        let _this = this;

        this.socket.off('LOAD_SEARCH_PARAMS').on('LOAD_SEARCH_PARAMS', function(data){
            _this.updateSearchParams(data);
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
            age         : [time.getAgeFromTime(data.age_min), time.getAgeFromTime(data.age_max)]
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

    // SAVER

    saveSearchParams = event => {

        let data = this.parseInputData();

        data.age_min = time.getTimeFromAge(data.age_min);
        data.age_max = time.getTimeFromAge(data.age_max);

        // console.log(data);
        // if (data){
        //     return;
        // }

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
