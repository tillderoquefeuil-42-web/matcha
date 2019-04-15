import React from 'react';

import { Component } from '../Component';
import { Loader } from '../loader/Loader';

import utils from '../../utils/utils.js';
import time from '../../utils/time';
import trans from '../../translations/translate';

import './history.css';

export class History extends Component {

    constructor(props) {
        super(props);

        this.state = {
            hosts   : null,
            visits  : null
        };

        this.socket = props._g.socket;
    }

    componentDidMount() {
        this._isMounted = true;

        document.title = utils.generatePageTitle(trans.get('PAGE_TITLE.HISTORY'));

        let _this = this;

        this.socket.off('LOAD_USER_VISITS').on('LOAD_USER_VISITS', function(data){
            _this.setState({
                hosts   : utils.indexCollection(data.hosts),
                visits  : data.visits
            });
        });

        this.socket.emit('GET_USER_VISITS');
    }

    getCollection(){

        if (!this.state.hosts || !this.state.visits){
            return;
        }

        let c = [];
        let hosts = this.state.hosts;
        let visits = this.state.visits;

        let lastVisit;
        for (let i in visits){
            let visit = visits[i];

            visit.host = hosts[visit.host_id];

            if (this.showVisit(visit, lastVisit)){
                c.push(visit);
            }

            lastVisit = visit;
        }

        c.sort(function(a, b){
            return (parseInt(b.date.replace('T', '')) - parseInt(a.date.replace('T', '')));
        });

        console.log(c);

        return c;
    }

    showVisit(visit, lastVisit){

        if (!lastVisit || visit.host_id !== lastVisit.host_id){
            return true;
        }

        if (visit.date.slice(0, 8) !== lastVisit.date.slice(0, 8)){
            return true;
        }

        return false;
    }



    render() {

        if (this.state.hosts === null){
            return (
                <center>
                    <Loader />
                </center>
            );
        }

        this.getCollection();
        return (
            <div>
                history
            </div>
        );
    }

}