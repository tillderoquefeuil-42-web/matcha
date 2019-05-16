import React from 'react';

import { Component } from '../Component';
import { Loader } from '../loader/Loader';

import { UserIcon } from '../layout/UserIcon';

import utils from '../../utils/utils.js';
import time from '../../utils/time';
import trans from '../../translations/translate';

import './notif.css';

const minItems = 10;

const labels = trans.get('NOTIFICATIONS.LABELS');

export class Notif extends Component {

    constructor(props) {
        super(props);

        this.state = {
            events  : null,
            count   : this.itemsCount()
        };

        this.socket = props._g.socket;
    }

    componentDidMount() {
        this._isMounted = true;

        document.title = utils.generatePageTitle(trans.get('PAGE_TITLE.NOTIF'));

        let _this = this;

        this.socket.on('LOAD_USER_EVENTS', function(data){
            _this.setState({
                events  : utils.indexCollection(data.events)
            });
        });

        this.socket.on('NEW_EVENT', function(data){
            let events = _this.state.events || {};
            events[data.event._id] = data.event;
            _this.setState({events : events})
            _this.socket.emit('USER_READ_EVENTS', {all:true});
        });

        this.socket.emit('USER_READ_EVENTS', {all:true});
    }

    componentDidUpdate() {

        if (this.iScroll && !this.iScroll.scrollListener){
            this.iScroll.addEventListener("scroll", () => {
                this.buildMoreElements();
            });
            this.iScroll.scrollListener = true;
        }
    }

    itemsCount() {
        let height = window.innerHeight;

        let count = Math.round(height / 50);
        return (count < minItems? minItems : count);
    }

    buildMoreElements() {

        let length = Object.values(this.state.events).length;

        if ((this.iScroll.scrollTop + this.iScroll.clientHeight >= this.iScroll.scrollHeight) && length > this.state.count){
            this.setState({count : this.state.count + this.itemsCount()});
        }
    }

    handleSelect = (e, item) => {
        if (!item.link){
            return;
        }

        this.socket.emit('GET_EXTENDED_PROFILE', {
            partner_id  : item.partner_id
        });
    }

    buildList() {

        let list = [];

        let c = Object.values(this.state.events);
        c.sort(function(a, b){
            return (parseInt(b.date.replace('T', '')) - parseInt(a.date.replace('T', '')));
        });

        let j = this.state.count;

        for (let i in c){
            if (j <= 0){
                break;
            }

            list.push(this.buildOneItem(c[i]));
            j--;
        }

        return list;
    }

    buildOneItem(item){

        item.key = item.label + '_' + item.date;

        return (
            <div
                className="notif-item c-pointer"
                onClick={(event) => this.handleSelect(event, item)}
                key={ item.key }
            >
                <OneNotif event={ item } />
            </div>
        );
    }

    render() {

        if (this.state.events === null){
            return (
                <center>
                    <Loader />
                </center>
            );
        }

        return (
            <div id="notifications-center" className="container">

                <div
                    className="list"
                    ref={ (el) => { this.iScroll = el; }}>
                    { this.buildList() }
                </div>

            </div>
        );
    }

}

export class OneNotif extends Component {

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

    render() {
        let event = this.props.event;

        if (!event){
            return null;
        }

        let duration = time.getDurationFrom(event.date);
        let lastTime = duration.humanize(true);

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
    
}