import React from 'react';

import { Component } from '../Component';
import { Contacts } from './Contacts';
import { Messages } from './Messages';
import { Loader } from '../loader/Loader';

import utils from '../../utils/utils';
import trans from '../../translations/translate';

import './chat.css';

export class Chat extends Component {

    constructor(props) {
        super(props);

        this.state = {
            selected        : null,
            friends         : null,
            conversations   : null
        };

        this.socket = props._g.socket;
    }

    componentWillUnmount() {
        this._isMounted = false;

        this.socket = null;
    }

    componentDidMount() {
        this._isMounted = true;
        document.title = utils.generatePageTitle(trans.get('PAGE_TITLE.CHAT'));

        let _this = this;

        this.socket.on('LOAD_CONVERSATIONS', function(data){

            let c = utils.indexCollection(data.conversations);

            let state = {conversations : c};

            let convId = _this.props._g.params.get('convId');
            if (convId && c[convId] && !_this.state.selected){
                state.selected = convId;
            }

            _this.setState(state);
        });

        this.socket.on('LOAD_CONTACTS', function(data){
            _this.setState({
                friends : data.friends
            });
        });

        this.socket.on('CHAT_UPDATE', function(data){
            _this.updateConv(data);
        });

        this.socket.on('DELETE_ONE_MATCH', function(data){
            _this.deleteOneFriend(data.match);
        });

        this.socket.emit('ON_CHAT');
    }

    updateConv(data) {

        if (data.conv){
            let conv = data.conv;
            let convs = this.state.conversations;

            if (convs){
                convs[conv._id] = conv;

                this.setState({
                    conversations   : convs
                });
            }
        } else if (data.ERROR){
            console.warn(data.ERROR);
        }
    }

    deleteOneFriend(matchId){
        let friends = this.state.friends;

        if (!matchId || !friends){
            return;
        }

        for (let i in friends){
            if (friends[i]._id === matchId){
                this.manageDelete(friends, i)
                break;
            }
        }
    }

    manageDelete(friends, index) {
        let matchId = friends[index]._id;
        let conv = this.findConvByMatchId(matchId);

        let convs = this.state.conversations;
        let selected = this.state.selected;

        if (convs && conv && convs[conv._id]){
            delete convs[conv._id];
            selected = null;
        }

        delete friends[index];
        friends = friends.filter(function (el) {
            return el != null;
        });

        this.setState({
            friends         : friends,
            conversations   : convs,
            selected        : selected
        });
    }

    findConvByMatchId(matchId) {

        let convs = this.state.conversations;

        for (let i in convs){
            let conv = convs[i];
            if (conv.partners){
                for (let i in conv.partners){
                    if (conv.partners[i] === matchId){
                        return conv;
                    }
                }
            }
        }

        return null;
    }

    updateUrl() {

        let current = window.history.state;
        if (this.state.selected){
            window.history.pushState(current, null, current["/"] + `?convId=${ this.state.selected }`);
            // window.history.replaceState(current, null, current["/"] + `?convId=${ this.state.selected }`);
        }
    }

    handleSelect = convId => {
        if (this.state.selected === convId){
            return;
        }

        this.setState({selected : convId});
    }

    render() {

        if (!this.state.friends || !this.state.conversations){
            return (
                <div className="center">
                    <Loader />
                </div>
            );
        }

        this.updateUrl();

        let data = {
            friends     : this.state.friends,
            convs       : this.state.conversations,
            conv        : this.state.conversations[this.state.selected],
            socket      : this.socket
        };

        return (
            <div id="chat-container" className="container-fluid">

                <Contacts
                    onSelect={ (convId) => this.handleSelect(convId) }
                    data={ data }
                />

                <Messages
                    selected={ this.state.selected }
                    data={ data }
                />

            </div>
        );
    }

}
