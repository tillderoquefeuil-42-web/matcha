import React from 'react';

import { Img } from './Img.js';
import trans from '../../translations/translate';
import './images.css';

export class Logo extends React.Component {

    constructor(props) {
        super(props);

        this.state = {};
    }

    redirect() {
        window.location = "/home";
    }

    getStyle(){
        let style = {};

        if (this.props.small){
            style = {
                maxHeight   : '45px',
                maxWidth    : '45px',
                marginTop   : '-12px',
                marginRight : '5px',
                display     : 'inline-flex'
            };
        }

        return style;
    }

    title() {
        if (this.props.withTitle){
            return (<h2>{ trans.get('GLOBAL.NAME') }</h2>);
        }    

        return;
    }    

    render() {
        return(
            <div className="logo" onClick={ () => this.redirect() } style={ this.getStyle() }>
                <Img name="logo.png" />

                { this.title() }

            </div>
        );
    }
}