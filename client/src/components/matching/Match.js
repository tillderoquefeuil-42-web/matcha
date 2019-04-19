import React from 'react';

import { Component } from '../Component';

import trans from '../../translations/translate';

export class LikeIcon extends Component {

    hasLiked() {
        let classes = 'left-half vertical-split';

        if (this.props.hasLiked){
            classes += ' active';
        }

        if (!this.props.disabled){
            classes += ' c-pointer';
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

    handleClick = e => {
        if (this.props.disabled || !this.props.onClick){
            return;
        }

        this.props.onClick(e);
    }

    render() {
        return (
            <div className="like-icon">
                <div className={ this.hasLiked() } onClick={ this.handleClick } title={ trans.get('USER.FIELDS.LIKE') }>
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
