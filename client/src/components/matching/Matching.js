import React from 'react';

import { Component } from '../Component';
import { Loader } from '../loader/Loader';

// import API from '../../utils/API';
import utils from '../../utils/utils.js';
import trans from '../../translations/translate';

import './matching.css';

export class Matching extends Component {

    constructor(props) {
        super(props);

        this.state = {
            matches : null,
        };

        this.socket = props._g.socket;
    }

    componentDidMount() {
        this._isMounted = true;
        document.title = utils.generatePageTitle(trans.get('PAGE_TITLE.MATCH'));

        let _this = this;

        this.socket.on('LOAD_MATCHES', function(data){
            _this.updateMatches(data.matches);
        });

        this.socket.emit('GET_MATCHES');
    }

    updateMatches(matches){
        console.log(matches);

        this.setState({
            matches : utils.indexCollection(matches)
        });
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
            </div>
        );
    }
}