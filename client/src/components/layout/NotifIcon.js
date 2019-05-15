import React from 'react';
import { Dropdown, Button } from 'react-bootstrap';
import { Component } from '../Component';
import { UserIcon } from './UserIcon';


import trans from '../../translations/translate';
import utils from '../../utils/utils.js';
import time from '../../utils/time';

const labels = trans.get('NOTIFICATIONS');
const transAgo = trans.get('COMMON.AGO');

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

    buildOptions() {

        let events = Object.values(this.state.events);

        console.log(events);

        events.sort(function(a, b){
            return (parseInt(b.date.replace('T', '')) - parseInt(a.date.replace('T', '')))
        })

        let options = [];

        for (let i in events){
            let event = events[i];
            event.key = event.label + '_' + i;

            options.push(
                <Button
                    className="dropdown-item"
                    key={ event.key }
                    onClick={ (e) => this.handleClick(event) }
                >
                    { this.buildOneNotif(event) }
                </Button>
            );
        }

        return options;
    }

    buildOneNotif(event) {

        let duration = time.getDurationFrom(event.date);
        let lastTime = duration.humanize() + ' ' + transAgo;

        return (
            <div className={ this.getNotifClasses(event) }>
                <UserIcon
                    user={ {profile_pic : event.partner_picture} }
                />

                <div className="one-notif-info">
                    <span className="one-notif-label">{ event.partner_label } { labels[event.type] }</span>
                    <span className="one-notif-date">{ lastTime }</span>
                </div>
            </div>
        );
    }

    getNotifClasses(event) {

        let classes = "one-notif";

        if (!event.read){
            classes += " unread";
        }

        if (!event.link){
            classes += " unlinkable";
        }

        return classes;
    }

    handleClick = event => {
        console.log(event);

        if (!event.link){
            return;
        }

        this.socket.emit('GET_EXTENDED_PROFILE', {
            partner_id  : event.partner_id
        });
    }


    render() {

        if (false !== true){
            return (
                <Dropdown id="notif-dropdown" className="notif-dropdown">
                    <Dropdown.Toggle id="dropdown-basic">
                        <i className="far fa-bell notifs" title="Notifications">
                            { this.buildUnreads() }
                        </i>
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        { this.buildOptions() }
                    </Dropdown.Menu>
                </Dropdown>
            );
        }

        return (
            <i className="far fa-bell notifs" title="Notifications">
                { this.buildUnreads() }
            </i>
        );



    }

    

}
