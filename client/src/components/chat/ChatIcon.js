import React from 'react';

import { Component } from '../Component';

export class ChatIcon extends Component {

    constructor(props) {
        super(props);

        this.state = {
            unread  : 0
        };

        this.socket = props._g.socket;
    }

    componentDidMount() {
        this._isMounted = true;

        let _this = this;

        this.socket.on('UNREAD_CHATS', function(data){
            _this.updateUnreads(data.unreads);
        });

        this.socket.emit('UNREAD_CHATS');
    }

    updateUnreads(unreads) {
        if (unreads && unreads.length !== this.state.unreads){
            this.setState({
                unread  : unreads.length
            });
        }
    }

    buildUnread() {
        let unread = this.state.unread;
        if (unread > 0){
            unread = unread > 9? '9+' : unread;
            return (<span className="sup">{ unread }</span>);
        }

        return null;
    }
    
    
    render() {
        
        return (
            <i className="far fa-comment notifs" title="Messages">
                { this.buildUnread() }
            </i>
        );
    }

}
