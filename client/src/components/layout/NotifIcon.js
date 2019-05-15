import React from 'react';
import { Dropdown, Button } from 'react-bootstrap';
import { Component } from '../Component';
import { OneNotif } from '../notif/Notif';

import utils from '../../utils/utils.js';
import trans from '../../translations/translate';

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
            _this.setState({
                events  : utils.indexCollection(data.events)
            });
        });

        this.socket.on('NEW_EVENT', function(data){
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

        events.sort(function(a, b){
            return (parseInt(b.date.replace('T', '')) - parseInt(a.date.replace('T', '')))
        })

        let options = [];

        options.push(
            <Button
                key="go-to-notif-center"
                className="go-to-notif-center"
                onClick={ (e) => this.openNotifCenter(e) }
            >
                { trans.get('NOTIFICATIONS.ALL') }
            </Button>
        );

        for (let i in events){
            let event = events[i];
            event.key = event.label + '_' + i;

            options.push(
                <Button
                    className="dropdown-item"
                    key={ event.key }
                    onClick={ (e) => this.handleClick(event) }
                >
                    <OneNotif event={ event } />
                </Button>
            );
        }

        return options;
    }

    openNotifCenter = e => {
        if (this.props.pageChange){
            this.props.pageChange('notifications');
        }
    }

    handleClick = event => {
        if (!event.link){
            return;
        }

        this.socket.emit('GET_EXTENDED_PROFILE', {
            partner_id  : event.partner_id
        });
    }

    handleToggle = show => {
        if (!show){
            return;
        }

        this.socket.emit('USER_READ_EVENTS');
    }

    render() {

        if (this.props.small){
            return (
                <i className="far fa-bell notifs sm-icon" title="Notifications">
                    { this.buildUnreads() }
                </i>
            );
        }

        return (
            <Dropdown
                id="notif-dropdown"
                className="notif-dropdown"
                onToggle={ (e) => this.handleToggle(e) }
            >
                <Dropdown.Toggle id="dropdown-basic">
                    <i className="far fa-bell notifs def-icon" title="Notifications">
                        { this.buildUnreads() }
                    </i>
                </Dropdown.Toggle>

                <Dropdown.Menu>
                    { this.buildOptions() }
                </Dropdown.Menu>
            </Dropdown>
        );
    }

}
