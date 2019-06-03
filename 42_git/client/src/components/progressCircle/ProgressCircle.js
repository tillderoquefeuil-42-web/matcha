import React from 'react';

import { Component } from '../Component';

import './progressCircle.css';


export class ProgressCircle extends Component {

    calculatePosition(value, inverse){
        let nbr = value % 25
        let x = (!nbr && value? 25 : nbr) * 4;

        return inverse? 100 - x : x;
    }

    getStyle() {

        let value = this.props.value;
        let clipPath = ['0% 0%', '50% 50%'];
        let found = false;
        let x;

        if (value > 75){
            x = this.calculatePosition(value, true);
            clipPath.push(`0% ${x}%`);
            found = true;
        } if (value > 50){
            x = found? 0 : this.calculatePosition(value, true);
            clipPath.push(`${x}% 100%`);
            found = true;
        } if (value > 25){
            x = found? 100 : this.calculatePosition(value);
            clipPath.push(`100% ${x}%`);
            found = true;
        } if (value > 0){
            x = found? 100 : this.calculatePosition(value);
            clipPath.push(`${x}% 0%`);
            found = true;
        }

        return {
            clipPath    : `polygon(${clipPath.join(', ')})`
        }
    }

    getClasses() {
        let classes = 'progress-circle';

        if (this.props.small){
            classes += ' small';
        }

        return classes;
    }


    render() {
        return(
            <div className={ this.getClasses() }>
                <div className="progress-circle-bar" style={ this.getStyle() }>
                </div>
            </div>
        );
    }

}