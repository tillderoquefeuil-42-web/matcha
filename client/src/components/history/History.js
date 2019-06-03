import React from 'react';

import { Component } from '../Component';
import { Loader } from '../loader/Loader';
import { UserIcon } from '../layout/UserIcon';

import utils from '../../utils/utils.js';
import time from '../../utils/time';
import trans from '../../translations/translate';

import './history.css';

const minItems = 10;

export class History extends Component {

    constructor(props) {
        super(props);

        this.state = {
            hosts   : null,
            visits  : null,
            count   : this.itemsCount()
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
                visits  : data.visits,
                length  : data.visits.length
            });
        });

        this.socket.off('LOAD_ONE_VISIT').on('LOAD_ONE_VISIT', function(data){
            _this.addOneVisit(data.visit);
        });


        this.socket.emit('GET_USER_VISITS');
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
        if ((this.iScroll.scrollTop + this.iScroll.clientHeight >= this.iScroll.scrollHeight) && this.state.length > this.state.count){
            this.setState({count : this.state.count + this.itemsCount()});
        }
    }

    addOneVisit(visit) {
        let visits = this.state.visits;

        visits.push(visit);
        this.setState({
            visits  : visits,
            length  : visits.length
        });
    }

    getCollection() {

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

        // console.log(c);

        return c;
    }

    showVisit(visit, lastVisit) {

        if (!lastVisit || visit.host_id !== lastVisit.host_id){
            return true;
        }

        if (visit.date.slice(0, 8) !== lastVisit.date.slice(0, 8)){
            return true;
        }

        return false;
    }

    visitDate(d) {
        let date = time.datetimeToMoment(d);

        let txt = trans.get('COMMON.THE') + ' ';
        txt += date.format('MM/DD/YYYY') + ' ';
        txt += trans.get('COMMON.AT') + ' ';
        txt += date.format('HH:mm');

        return txt;
    }

    handleSelect = (e, item) => {
        if (!item || !utils.isDefine(item.host_id)){
            return;
        }

        utils.getExtendedProfile(this.socket, item.host_id);
    }

    buildList() {

        let list = [];
        let c = this.getCollection();
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
        if (!item || !item.host){
            return null;
        }

        let date = this.visitDate(item.date);

        return (
            <div
                className="history-item c-pointer"
                onClick={(event) => this.handleSelect(event, item)}
                key={ item._id }
            >

                <span className="user-icon">
                    <UserIcon user={ item.host } />
                </span>

                <div className="history-item-content">
                    <span className="history-item-date">{ date }</span>
                    <span className="history-item-name">{ item.host.firstname }</span>
                </div>
            </div>
        );
    }

    render() {

        if (this.state.hosts === null){
            return (
                <center>
                    <Loader />
                </center>
            );
        }

        return (
            <div id="history" className="container">

                <div
                    className="list"
                    ref={ (el) => { this.iScroll = el; }}>
                    { this.buildList() }
                </div>

            </div>
        );
    }

}