import React from 'react';

import { Component } from '../Component';
import { SearchBar } from '../searchBar/SearchBar';
import { UserIcon } from '../layout/UserIcon';

import utils from '../../utils/utils';
import time from '../../utils/time';
import translate from '../../translations/translate';

export class Contacts extends Component {

    constructor(props){
        super(props);

        this.state = {
            search      : '',
            selected    : null
        };

        this.socket = props.data.socket;
    }

    componentDidMount() {
        this._isMounted = true;

        let _this = this;

        this.socket.on('CHAT_SELECTED', function(data){
            if (data.conv){
                _this.props.onSelect(data.conv._id);
                _this.setState({
                    selected    : data.conv._id
                });
            } else if (data.ERROR){
                console.warn(data.ERROR);
            }
        });

        if (!this.state.selected && this.firstConv){
            let partnerId = this.getPartnerId(this.firstConv);
            this.handleSelect(null, {_id : partnerId});
        }

    }

    getPartnerId(conv) {
        let user = utils.getLocalUser();

        if (conv.partners){
            for (let i in conv.partners){
                if (conv.partners[i] !== user._id){
                    return parseInt(conv.partners[i]);
                }
            }
        }

        return null;
    }

    getPartnerByConv(conv) {

        let id = this.getPartnerId(conv);
        let partners = this.props.data.friends;

        for (let i in partners){
            if (partners[i]._id === id){
                return partners[i];
            }
        }

        return null;
    }

    handleChangeSelected = convId => {
        this.props.onSelect(convId);
        this.setState({
            selected    : convId
        });
    }

    hasBeenRead(conv) {
        let user = utils.getLocalUser();

        if (!conv.members){
            return true;
        }

        return !(conv.members[user._id])
    }

    parseConvs(c) {
        let collection = [];

        for (let i in c){
            let conv = c[i];

            if (!conv.last_message){
                continue;
            }

            conv.params = {
                partner     : this.getPartnerByConv(conv),
                selected    : (conv._id === this.state.selected)? true : false,
                read        : this.hasBeenRead(conv)
            };

            if (conv.params.partner){
                collection.push(conv);
            }
        }

        return collection.sort(function(a, b){
            return (parseInt(b.last_message.date) - parseInt(a.last_message.date));
        });
    }

    generateContacts() {
        let c = [];

        let data = this.props.data;
        if (data.friends){
            let convs = this.parseConvs(data.convs);

            if (convs && convs[0] && !this.firstConv && !this.state.selected){
                this.firstConv = convs[0];
            }

            for (let i in convs){
                let conv = convs[i];
                let params = conv.params

                c.push( <Contact 
                    key={ conv._id } 
                    item={ conv }
                    partner={ params.partner }
                    message={ conv.last_message }
                    selected={ params.selected }
                    read={ params.read }
                    changeSelected={ (convId) => this.handleChangeSelected(convId) }
                />);
            }
        }

        return c;
    }

    createSearchBar(){

        let friends = this.props.data.friends;
        if (friends){
            return (
                <div className="searchbar-container">
                    <SearchBar
                        collection={ friends }
                        onSelect={(event, item) => this.handleSelect(event, item)}
                        getLabel={ function(item){ return (item.firstname + ' ' + item.lastname); } }
                    />
                </div>
            );
        }

        return null;
    }

    handleSelect = (event, item) => {
        this.socket.emit('SELECT_ONE_CHAT', {partner_id : item._id});
    }

    render() {

        return (
            <div id="contacts-container" className="col-md-3">
                { this.createSearchBar() }
                { this.generateContacts() }
            </div>
        );
    }

}


export class Contact extends React.Component {

    sendLastMessage(){
        let partner = this.props.partner;
        let message = this.props.message;

        if (!message){
            return null;
        }

        if (parseInt(message.sender_id) === partner._id){
            return partner.firstname + ' : ';
        }

        return translate.get('COMMON.YOU') + ' : ';
    }

    getLastTime() {
        let message = this.props.message;
        if (!message){
            return null;
        }

        let date = time.Moment((new Date()).setTime(message.date));

        if (time.isSameDay(date)){
            return date.format('LT');
        } else if (time.isRecent(date)){
            return date.format('ddd');
        }

        return date.format('MMM DD');
    }

    getLastMessageValue() {
        let message = this.props.message;
        if (!message){
            return null;
        }

        if (!message.value && message.files && (Object.values(message.files)).length > 0){
            return translate.get('CHAT.FILE.SENT');
        }

        return message.value;
    }

    getPartnerLabel() {
        let partner = this.props.partner;
        return partner.firstname + ' ' + partner.lastname;
    }

    getContactClasses() {
        let classes = 'one-contact ';

        if (this.props.selected){
            classes += 'selected ';
        }
        
        if (!this.props.read){
            classes += 'updated ';
        }

        return classes;
    }

    getPartnerProfilePicture(){

        return (
            <UserIcon user={ this.props.partner } />
        )

    }

    handleClick = event => {
        this.props.changeSelected(this.props.item._id);
    }

    render() {
        return (
            <div className={ this.getContactClasses() } onClick={ this.handleClick }>

                <div className="contact-picture">
                    <div>{ this.getPartnerProfilePicture() }</div>
                </div>

                <div className="contact-infos">
                    <div className="contact-name">
                        <span className="contact-full-name ellipsis">{ this.getPartnerLabel() }</span>
                        <span className="last-date">{ this.getLastTime() }</span>
                    </div>

                    <div className="conversation-info">
                        <span className="last-autor-msg ellipsis">
                            { this.sendLastMessage() }{ this.getLastMessageValue() }
                        </span>
                    </div>
                </div>

            </div>
        );
    }

}