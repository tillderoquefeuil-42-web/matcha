import React from 'react';
import { FormGroup, ControlLabel } from 'react-bootstrap';

import { Component } from '../Component';
import { Slider, Range } from '../slider/Slider';

import trans from '../../translations/translate';
import utils from '../../utils/utils.js';


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

export class Distance extends Component {

    render() {

        let value = (this.props.value !== null)? this.props.value : defaultParams.distance.default;

        return (
            <FormGroup controlId="distance">
                <ControlLabel>{ trans.get('USER.FIELDS.DISTANCE') }</ControlLabel>
                <Slider
                    step={ 1 }
                    min={ defaultParams.distance.min }
                    max={ defaultParams.distance.max }
                    marks={ defaultParams.distance.marks }
                    value={ value }
                    handleChange={ this.props.onChange }
                />
            </FormGroup>
        );
    }
}

export class Age extends Component {

    render() {
        let value = (this.props.value !== null)? this.props.value : [defaultParams.age.min, defaultParams.age.max];

        return (
            <FormGroup controlId="age">
                <ControlLabel>{ trans.get('USER.FIELDS.AGE') }</ControlLabel>
                <Range
                    step={ 1 }
                    min={ defaultParams.age.min }
                    max={ defaultParams.age.max }
                    marks={ defaultParams.age.marks }
                    value={ value }
                    handleChange={ this.props.onChange }
                />
            </FormGroup>
        );
    }
}

export class Popularity extends Component {

    render() {
        let value = (this.props.value !== null)? this.props.value : [defaultParams.popularity.min, defaultParams.popularity.max];

        return (
            <FormGroup controlId="popularity">
                <ControlLabel>{ trans.get('USER.FIELDS.POPULARITY') }</ControlLabel>
                <Range
                    step={ 1 }
                    min={ defaultParams.popularity.min }
                    max={ defaultParams.popularity.max }
                    marks={ defaultParams.popularity.marks }
                    value={ value }
                    handleChange={ this.props.onChange }
                />
            </FormGroup>
        );
    }
}

export class OneProfile extends Component {

    render() {
        
        let match = this.props.match

        if (!match){
            return null;
        }

        return (
            <div
                className="one-profile"
                onClick={ () => this.props.onSelect(match._id) }
            >

                <div className="profile-pic">
                    <img src={ utils.getFileUrl(match.profile_pic) } alt="" />
                </div>

                <h1>{ match.firstname }</h1>
                <span>{ match.age }</span>
            </div>
        );
    }

}
