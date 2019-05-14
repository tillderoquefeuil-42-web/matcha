import React from 'react';

import { Component } from '../Component';

// import trans from '../../translations/translate';
import utils from '../../utils/utils.js';

export class NotifIcon extends Component {

    constructor(props) {
        super(props);

        this.state = {
            events  : {}
        };

        this.socket = props._g.socket;
    }

    componentDidMount() {
        this._isMounted = true;

        let _this = this;

        this.socket.on('LOAD_USER_EVENTS', function(data){
            console.log(data);

            _this.setState({
                events  : utils.indexCollection(data.events)
            });
        });

        this.socket.on('NEW_EVENT', function(data){
            console.log(data);

            let events = _this.state.events;
            events[data.event._id] = data.event;
            _this.setState({events : events})
        });

        this.socket.emit('GET_USER_EVENTS');
    }

    getUnreads() {

        let events = this.state.events;
        let unreads = 0;

        for (let i in events){
            unreads += (events[i].read? 0 : 1);
        }

        return unreads;
    }

    buildUnreads() {
        let unreads = this.getUnreads();
        if (unreads > 0){
            unreads = unreads > 9? '9+' : unreads;
            return (<span className="sup">{ unreads }</span>);
        }

        return null;
    }


    render() {

        return (
            <i className="far fa-bell notifs" title="Notifications">
                { this.buildUnreads() }
            </i>
        );
    }

}
