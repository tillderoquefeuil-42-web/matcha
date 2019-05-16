import React from 'react';

import { Component } from '../Component';

import trans from '../../translations/translate';
import time from '../../utils/time';

export class Online extends Component {

    getClasses() {
        if (this.props.value === true){
            let classes = 'fas fa-circle c-green';
            return classes;
        }

        return;
    }

    lastTime() {
        let value = this.props.value;

        if (!value){
            return;
        }

        let lastTime;

        if (value !== true){
            let duration = time.getDurationFrom(value);
            lastTime = duration.humanize(true);
        } else if (!this.props.chat){
            lastTime = trans.get('USER.FIELDS.ONLINE');
        }

        return lastTime;
    }

    render() {
        if (!this.props.value){
            return null;
        }

        return (
            <span className="online-info">
                <i className={ this.getClasses() }></i>
                { this.lastTime() }
            </span>
        );
    }

}