import React from 'react';

import { Component } from '../Component';
import { Messages } from './Messages';
import { UserIcon } from '../layout/UserIcon';
import { SearchBar } from '../searchBar/SearchBar';

import utils from '../../utils/utils';

import './chat.css';

function getPartnerId(conv, user) {
    if (conv.partners){
        for (let i in conv.partners){
            if (conv.partners[i] !== user._id){
                return parseInt(conv.partners[i]);
            }
        }
    }

    return null;
}


export class FooterChat extends Component {

    constructor(props) {
        super(props);

        this.state = {
            chats           : [],
            friends         : null,
            convs           : {},
            show_searchbar  : false
        };

        this.socket = props._g.socket;
    }

    componentDidMount() {
        this._isMounted = true;

        this.lastChats = [];
        this.unreadChats = [];

        let _this = this;

        this.socket.on('LOAD_CONTACTS', function(data){
            _this.setState({
                friends : data.friends
            });
        });

        this.socket.on('CHAT_SELECTED_FOOTER', function(data){
            if (data.conv){

                data.conv.open = _this.setOpenConv(data.conv);
                data.conv.unread = _this.setUnreadConv(data.conv);

                let convs = _this.manageConvs(data.conv);

                _this.setState({
                    convs : convs
                });
            }
        });

        this.socket.on('UNREAD_CHATS', function(data){
            _this.loadUnreadConvs(data.unreads);
        });


        this.socket.emit('ON_CHAT');

        this.loadLastConvs();
    }

    componentDidUpdate() {
        this.saveLastPartners()
    }

    manageConvs(conv){

        let convs = this.state.convs;

        if (convs[conv._id]){
            convs[conv._id] = conv;
            return convs;
        }

        let max = window.innerWidth;
        let convNb = utils.objectLength(convs) + 1;

        let width = 75 + (250 * convNb);

        if (width < max){
            convs[conv._id] = conv;
            return convs;
        } else if (conv.unread){
            return convs;
        }

        for (let i in convs){
            delete convs[i];
            break;
        }

        convs[conv._id] = conv;
        return convs;
    }

    saveLastPartners() {

        let user = utils.getLocalUser();
        let chats = this.state.convs;
        let partnersId = [];

        for (let i in chats){
            let id = getPartnerId(chats[i], user);
            if (id){
                partnersId.push(id);
            }
        }

        utils.setFooterChats(partnersId);
    }

    loadLastConvs() {

        let chatsId = utils.getFooterChats();

        for (let i in chatsId){

            if (this.lastChats.indexOf(chatsId[i]) !== -1){
                continue;
            }

            this.lastChats.push(chatsId[i]);

            this.socket.emit('SELECT_ONE_CHAT', {
                partner_id  : chatsId[i],
                status      : 'footer_chat'
            });
        }
    }

    loadUnreadConvs(unreads) {
        if (!unreads || !unreads.length){
            return;
        }

        let user = utils.getLocalUser();

        for (let i in unreads){
            let id = getPartnerId(unreads[i], user);
            if (this.unreadChats.indexOf(id) !== -1){
                continue;
            }
            this.unreadChats.push(id);

            this.socket.emit('SELECT_ONE_CHAT', {
                partner_id  : id,
                status      : 'footer_chat'
            });
        }

    }

    setOpenConv(conv) {

        if (this.lastChats && this.lastChats.length > 0){

            let user = utils.getLocalUser();
            let partnerId = getPartnerId(conv, user);

            let index = this.lastChats.indexOf(partnerId);
            if (index !== -1){
                delete this.lastChats[index];
                return false;
            }
        }

        return true;
    }

    setUnreadConv(conv) {

        if (this.unreadChats && this.unreadChats.length > 0){

            let user = utils.getLocalUser();
            let partnerId = getPartnerId(conv, user);

            let index = this.unreadChats.indexOf(partnerId);
            if (index !== -1){
                delete this.unreadChats[index];
                return true;
            }
        }

        return false;
    }

    closeOneChat(convId){
        let convs = this.state.convs;

        if (convs[convId]){
            delete convs[convId];
        }

        this.setState({convs : convs});
    }

    showSearchbar = event => {
        if (!this.state.show_searchbar){
            this.setState({show_searchbar : true});
        }
    }

    hideSearchbar = event => {
        if (this.state.show_searchbar){
            this.setState({show_searchbar : false});
        }
    }

    createSearchBar(){
        if (!this.state.show_searchbar){
            return (
                <span className="search-friends" onClick={ this.showSearchbar }>
                    <i className="fa fa-users"></i>
                </span>
            );
        }

        return (
            <div>
                <SearchBar
                    collection={ this.state.friends }
                    onSelect={(event, item) => this.handleSelect(event, item)}
                    getLabel={ function(item){ return (item.firstname + ' ' + item.lastname); } }
                    onClose={ event => this.hideSearchbar(event) }
                    defaultOpen
                    autofocus
                />
            </div>
        );
    }

    buildSearchBar() {
        if (!this.state.friends){
            return null;
        }

        return (
            <div className="searchbar-container">
                { this.createSearchBar() }
            </div>
        );

    }

    handleSelect = (event, item) => {
        this.socket.emit('SELECT_ONE_CHAT', {
            partner_id  : item._id,
            status      : 'footer_chat'
        });
    }

    buildChats() {

        let chats = [];
        let convs = this.state.convs;

        for (let i in convs){
            chats.push(
                <ChatWindow
                    key={i}
                    socket={ this.socket }
                    conv={ convs[i] }
                    friends={ this.state.friends }
                    closeChat={ convId => this.closeOneChat(convId) }
                />
            );
        }

        return chats;
    }

    render() {

        if (!this.state.friends){
            return null;
        }

        return (
            <div id="footer-chat-container">
                { this.buildSearchBar() }
                { this.buildChats() }
            </div>
        );
    }

}

class ChatWindow extends Component {

    constructor(props) {
        super(props);

        this.state = {
            display : props.conv.open,
            unread  : props.conv.unread
        };
    }

    showWindow = event => {
        if (!this.state.display){
            this.setState({
                display : true,
                unread  : false
            });
        }
    }

    hideWindow = event => {
        event.preventDefault();
        event.stopPropagation();

        if (this.state.display){
            this.setState({display : false});
        } else if (this.props.closeChat){
            this.props.closeChat(this.props.conv._id);
        }
    }

    getPartnerId(conv) {
        let user = utils.getLocalUser();

        return getPartnerId(conv, user);
    }

    getPartner() {
        let partner = null;

        let id = this.getPartnerId(this.props.conv);
        let partners = this.props.friends;

        for (let i in partners){
            if (partners[i]._id === id){
                partner = partners[i];
                break;
            }
        }

        return partner;
    }

    getPartnerLabel(partner) {
        return partner.firstname + ' ' + partner.lastname;
    }

    newMessage() {
        this.setState({unread : true});
    }

    messageSeen() {
        this.setState({unread : false});
    }

    getData() {
        let data = {
            conv    : this.props.conv,
            socket  : this.props.socket,
            friends : this.props.friends
        };

        return data;
    }

    getClasses(base) {
        let classes = 'one-chat-' + base;

        if (this.state.display){
            classes += ' active';
        }

        if (this.state.unread){
            classes += ' unread';
        }

        return classes;
    }

    render() {
        if (!this.props.conv){
            return null;
        }

        let partner = this.getPartner();

        return (
            <div className={ this.getClasses('container') } onClick={ this.showWindow }>
                <span className="close-chat-window" onClick={ this.hideWindow }>
                    <i className="fa fa-times-circle"></i>
                </span>

                <div className="contact">
                    <div>
                        <UserIcon user={ partner } />
                    </div>
                    <strong>{ this.getPartnerLabel(partner) }</strong>
                </div>

                <div className={ this.getClasses('window') }>
                    <Messages
                        newMessage={ () => this.newMessage() }
                        messageSeen={ () => this.messageSeen() }
                        selected={ this.props.conv._id }
                        data={ this.getData() }
                        open={ this.state.display }
                        unread={ this.state.unread }
                        miniChat
                    />
                </div>
            </div>
        );
    }

}