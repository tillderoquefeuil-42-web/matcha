import React from 'react';
import { Button, FormGroup, ControlLabel } from 'react-bootstrap';

import { Slider, Range } from '../slider/Slider';
import { Component } from '../Component';

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
    }
}

export class Search extends Component {

    constructor(props) {
        super(props);

        this.state = {
            distance    : defaultParams.distance.default,
            age         : [defaultParams.age.min, defaultParams.age.max]
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

    setDistance = distance => {
        this.setState({distance : distance});
    }

    setAge = age => {
        this.setState({age : age});
    }


    // SAVER

    saveSearchParams = event => {
        let age = this.state.age;

        let data = {
            distance    : this.state.distance,
            age_min     : time.getTimeFromAge(age[0]),
            age_max     : time.getTimeFromAge(age[1])
        };

        this.socket.emit('SET_SEARCH_PARAMS', data);
    }


    render() {

        return(

            <div id="search-params" className="account-block" >
                <h2 className="form-section">{ trans.get('MATCHING.PARAMS') }</h2>

                <FormGroup controlId="distance">
                    <ControlLabel>{ trans.get('USER.FIELDS.DISTANCE') }</ControlLabel>
                    <Slider
                        step={ 1 }
                        min={ defaultParams.distance.min }
                        max={ defaultParams.distance.max }
                        marks={ defaultParams.distance.marks }
                        value={ this.state.distance }
                        handleChange={ this.setDistance }
                    />
                </FormGroup>

                <FormGroup controlId="age">
                    <ControlLabel>{ trans.get('USER.FIELDS.AGE') }</ControlLabel>
                    <Range
                        step={ 1 }
                        min={ defaultParams.age.min }
                        max={ defaultParams.age.max }
                        marks={ defaultParams.age.marks }
                        value={ this.state.age }
                        handleChange={ this.setAge }
                    />
                </FormGroup>


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