import React from 'react';

import { Tooltip, OverlayTrigger } from "react-bootstrap";
import { Picker } from 'emoji-mart';

import { Component } from '../Component';
import { UserIcon } from '../layout/UserIcon';
import { Loader } from '../loader/Loader';
import { Dropzone, FileContainer, OneFileView, FileInput } from '../images/Dropzone';

import utils from '../../utils/utils';
import filesManager from '../../utils/files';
import time from '../../utils/time';
import translate from '../../translations/translate';

import 'emoji-mart/css/emoji-mart.css';

const urlRegex = utils.linkifyRegexp();

export class Messages extends Component {

    constructor(props) {
        super(props);

        this.state = {
            message     : '',
            messages    : null,
            conv_id     : null,
            on_drop     : false,
            files       : [],
            waiting     : {},
            items       : 0,
            loadingState: false
        };

        this.socket = props.data.socket;

        this.buildMoreMessages.bind(this);
    }

    componentDidMount() {
        this._isMounted = true;

        let _this = this;

        this.socket.on('LOAD_MESSAGES', function(data){

            if (data.ERROR){
                console.warn(data.ERROR);
                return;
            }

            let states = {
                messages    : _this.state.messages || [],
                items       : _this.state.items || 0
            };

            if (_this.state.conv_id && parseInt(data.conv_id) !== _this.state.conv_id){

                if (_this.props.miniChat){
                    return;
                }

                _this.socket.emit('LEAVE_ONE_CHAT', {
                    conv_id : _this.state.conv_id
                });

                states.messages = [];
                states.items = 0;
            }

            if (_this.props.miniChat && parseInt(data.conv_id) !== _this.props.selected){
                return;
            }

            states.conv_id = parseInt(data.conv_id);
            states.messages = _this.sortMessagesByDate(data.messages, states.messages);
            states.message = '';
            states.files = [];
            states.on_drop = false;
            states.items = states.items + data.messages.length;
            states.loadingState = false;

            _this.setState(states);

            if (!data.items){
                _this.scrollToBottom();
            } else if (_this.iScroll){
                _this.iScroll.over = (!data.messages.length || data.messages.length < 50)? true : false;
            }

            _this.readChat(true);
        });

        this.socket.on('NEW_MESSAGE', function(data){
            if (data.message && data.message.conv_id === _this.state.conv_id){
                _this.addMessage(data.message);
                _this.scrollToBottom();
            }
        });

        this.socket.on('MESSAGE_FILE_UPDATE', function(data){
            if (data.message && data.message.conv_id === _this.state.conv_id){
                _this.updateMessageFile(data.message);
                _this.scrollToBottom();
            }
        });

    }

    componentDidUpdate() {

        if (this.iScroll && !this.iScroll.scrollListener){
            this.iScroll.addEventListener("scroll", () => {
                this.buildMoreMessages();
            });
            this.iScroll.scrollListener = true;
        }

        if (this.props.miniChat && this.props.open){
            this.readChat();
        }
    }

    // ***** USEFULL ***** //

    updatePageTitle() {

        if (!this.state.conv_id || this.state.conv_id === this.pageTitle){
            return;
        }

        let partner = this.getPartner();
        let partnerLabel = this.getPartnerLabel(partner);
        document.title = utils.generatePageTitle(partnerLabel);

        this.pageTitle = this.state.conv_id;
    }

    getResetState() {

        return {
            message     : '',
            on_drop     : false,
            files       : [],
            items       : 0,
            loadingState: false
        }
    }

    scrollToBottom = () => {
        if (this.endBlock){
            this.endBlock.scrollIntoView({ behavior: "smooth" });
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

    getPartner() {
        let data = this.props.data;
        let partner = null;

        let id = this.getPartnerId(data.conv);
        let partners = data.friends;

        for (let i in partners){
            if (partners[i]._id === id){
                partner = partners[i];
                break;
            }
        }

        return partner;
    }

    sortMessagesByDate(msg, old) {

        old = old || [];
        let c = utils.indexCollection(msg.concat(old));

        let messages = Object.values(c);

        return messages.sort(function(a, b){
            return (parseInt(a.date) - parseInt(b.date))
        })
    }

    getPartnerLabel(partner) {
        return partner.firstname + ' ' + partner.lastname;
    }


    // ***** SOCKET CALL ***** //

    joinOneChat(convId) {
        this.socket.emit('JOIN_ONE_CHAT', {
            conv_id : convId
        });
    }

    readChat(force) {

        if (this.props.miniChat && !force){
            return;
        }

        this.socket.emit('USER_READ_CHAT', {
            conv_id     : this.state.conv_id
        });
    }

    sendOneMessage(message, filesId, convId) {
        this.socket.emit('SEND_MESSAGE', {
            conv_id     : convId,
            files_id    : filesId,
            msg_value   : message
        });
    }

    // ***** FILES ***** //

    addOneFile(file) {
        let files = this.state.files;
        files.push(file);

        this.setState({files : files});
    }

    removeOneFile(fileId) {
        let files = [];

        for (let i in this.state.files){
            let file = this.state.files[i];

            if (file.id !== fileId){
                files.push(file);
            }
        }

        this.setState({files : files});
    }

    getFilesId(files){
        let ids = [];

        for (let i in files){
            ids.push(files[i].id);
        }

        return ids;
    }

    parseFilesInWaiting(files){
        let waiting = this.state.waiting;

        for (let i in files){
            waiting[files[i].id] = files[i];
        }

        return waiting;
    }

    parseFilesMessage(message){

        let files = [];
        let waiting = this.state.waiting;

        for (let i in message.files){
            let file = message.files[i];
            if (typeof file !== 'object' && waiting[file]){
                files.push(waiting[file]);
                delete waiting[file];
            }
        }

        let params = {
            conv_id : this.state.conv_id,
            file_case   : 'chat'
        }

        filesManager.setSocket(this.socket);
        filesManager.sendFiles(files, params);

        this.setState({waiting : waiting});
    }


    // ***** READ CONV ***** //

    handleMouseEnter = event => {

        if (this.props.unread || !this.props.miniChat){
            if (this.props.messageSeen){
                this.props.messageSeen();
            }

            this.readChat(true);
        }
    }


    // ***** MESSAGE INPUT ***** //

    handleChange = event => {
        this.setState({[event.target.name] : event.target.value});
    }

    setMessage(message) {
        this.setState({message : message});
    }

    sendMessage() {
        let convId = this.state.conv_id;
        let message = this.state.message;

        let files = this.state.files;
        let filesId = this.getFilesId(files);

        if ((!message.trim() && !filesId.length) || !convId){
            return;
        }

        this.sendOneMessage(message, filesId, convId);

        let waiting = this.parseFilesInWaiting(files);

        this.setState({
            message : '',
            waiting : waiting,
            files   : [],
            on_drop : false
        });

    }

    addMessage(message) {
        let user = utils.getLocalUser();

        if (message.files){
            this.parseFilesMessage(message);
        }

        let own = (parseInt(message.sender_id) === user._id)? true : false;
        let messages = this.state.messages;
        messages.push(message);

        this.setState({
            messages    : this.sortMessagesByDate(messages),
            message     : own? '' : this.state.message
        });

        if (this.props.miniChat && this.props.newMessage && !own){
            this.props.newMessage();
        }

        // this.readChat();
    };

    updateMessageFile(message) {
        if (!message || !message.file){
            return;
        }

        let id = parseInt(message._id);

        let messages = this.state.messages;

        for (var i in messages){
            if (parseInt(messages[i]._id) === id){
                let fileIndex = messages[i].files.indexOf(message.file.id);
                if (fileIndex !== -1){
                    messages[i].files[fileIndex] = message.file;
                }
                break;
            }
        }

        this.setState({messages : messages});
    };


    // ***** CONTENT ***** //

    loadingMore() {

        if (this.state.loadingState){
            return (
                <div className="center more-msg-loader">
                    <Loader />
                </div>
            );
        }

        return;
    }

    buildMoreMessages() {

        if (this.iScroll && this.iScroll.scrollTop < this.iScroll.clientHeight && !this.state.loadingState && !this.iScroll.over){
            this.setState({ loadingState: true });

            this.socket.emit('JOIN_ONE_CHAT', {
                conv_id : this.props.selected,
                items   : this.state.items
            });
        }
    }

    buildMessages() {
        let messages = [];
        let user = utils.getLocalUser();
        
        for (let i in this.state.messages){
            let message = this.state.messages[i];
            if (parseInt(message.sender_id) !== user._id){
                message.partner = true;
            }

            let msgId = message._id + '_' + message.date;

            messages.push(
                <Message key={ msgId } item={ message }/>
            );
        }

        return messages;
    }

    buildSections() {
        let partner = this.getPartner();

        return (
            <div
                className="open-conversation"
                onMouseEnter={ this.handleMouseEnter }
            >
                <div className="contact">
                    <div>
                        <UserIcon user={ partner } />
                    </div>
                    <strong>{ this.getPartnerLabel(partner) }</strong>
                </div>

                <Dropzone
                    className="messages-content"
                    files={ this.state.files }
                    addFile={ (file) => this.addOneFile(file) }
                >

                    <div className="messages" ref={ (el) => { this.iScroll = el; }}>
                        { this.loadingMore() }
                        { this.buildMessages() }
                        <div ref={ (el) => { this.endBlock = el; }}></div>
                    </div>

                    <MessageInput
                        files={ this.state.files }
                        message={ this.state.message }
                        removeFile={ (fileId) => this.removeOneFile(fileId) }
                        setMessage={ (m) => this.setMessage(m) }
                        sendMessage={ () => this.sendMessage() }
                        onChange={ (event) => this.handleChange(event) }
                        addFile={ (file) => this.addOneFile(file) }
                    />

                </Dropzone>
            </div>
        );

    }

    buildContent(convId) {

        convId = parseInt(convId);
        if (!convId){
            return (
                <span>No conversation selected</span>
            );
        }

        if (!this.state.messages || convId !== this.state.conv_id){
            this.joinOneChat(convId);

            return (
                <div className="center">
                    <Loader />
                </div>
            );
        }

        return this.buildSections();
    }

    render() {

        this.updatePageTitle()

        return (
            <div id="messages-container" className="col-md-9">
                { this.buildContent(this.props.selected) }
            </div>
        );
    }

}

export class MessageInput extends Component {

    constructor(props) {
        super(props);

        this.attach_input = React.createRef();

        this.state = {
            showEmoji   : false,
            message     : null
        };
    }


    // ***** EMOJI ***** //

    addEmoji = event => {

        let emojiPic;

        if (event.unified.length <= 5){
            emojiPic = String.fromCodePoint(`0x${event.unified}`)

        } else {
            let symbol = event.unified.split('-');
            let codesArray = [];

            for (let i in symbol){
                codesArray.push('0x' + symbol[i]);
            }

            emojiPic = String.fromCodePoint(...codesArray)
        }

        if (emojiPic){
            this.setMessage(this.props.message + emojiPic);
            this.collapse();
        }
    }

    handleEmoji = event => {
        if (!this.state.showEmoji){
            this.expand();
        }
    }

    emojiClasses(){
        let classes = 'emoji-picker ';

        if (!this.state.showEmoji){
            classes += 'no-display ';
        }

        return classes;
    }

    expand = event => {
        document.removeEventListener('mousedown', this.handleMouseDown);
        document.addEventListener('mousedown', this.handleMouseDown);
        this.setState({showEmoji:true});
    }
    
    collapse = event => {
        document.removeEventListener('mousedown', this.handleMouseDown);
        this.setState({showEmoji:false});

        this.message_input.focus();
    }

    upTo(element, oneClass) {
        while (element && element.parentNode) {
            element = element.parentNode;
            if (element.className && element.className.split(' ').indexOf(oneClass) !== -1) {
                return element;
            }
        }
        return null;
    }

    handleMouseDown = event => {

        if (!this.upTo(event.toElement, 'emoji-picker')){
            this.collapse();
        }
    }


    // ***** ATTACH ***** //

    handleAttach = event => {
        this.attach_input.current.triggerClick();
    }

    addOneFile(file){
        file.id = (new Date()).getTime();
        this.props.addFile(file);
    }




    // ***** EVENTS ***** //

    setMessage(message){
        this.props.setMessage(message);
    }

    handleChange = event => {
        this.props.onChange(event);
    }

    handleKeyPress = event => {
        if (event.key === 'Enter'){
            this.props.sendMessage();
        }
    }

    handleClick = event => {
        this.props.sendMessage();
    }


    // ***** CONTENT ***** //

    render() {
        return (
            <div className="message-input-container" onKeyPress={this.handleKeyPress}>
                <FileContainer
                    files={ this.props.files }
                    removeFile={ (fileId) => this.props.removeFile(fileId) }
                />

                <div className="message-input">
                    <input 
                        autoFocus 
                        autoComplete="off"
                        type="text"
                        name="message"
                        className="message"
                        ref={ (input) => { this.message_input = input; } }
                        placeholder={ translate.get('CHAT.WRITE') + ' ...' }
                        value={this.props.message} 
                        onChange={this.handleChange}
                    />

                    <i
                        className="fas fa-paperclip"
                        onClick={ this.handleAttach }
                    >
                        <FileInput
                            className="attach-files"
                            files={ this.props.files }
                            addFile={ (file) => this.addOneFile(file) }
                            ref={ this.attach_input }
                            multiple="1"
                        />
                    </i>

                    <i className="far fa-smile" onClick={ this.handleEmoji }>
                        <span className={ this.emojiClasses() } >
                            <Picker onSelect={this.addEmoji} />
                        </span>
                    </i>
                    <i className="fa fa-paper-plane" onClick={ this.handleClick }></i>
                </div>

            </div>
        );
    }

}

export class Message extends Component {

    constructor(props) {
        super(props);

        this.state = {
            message    : null
        };
    }

    getClasses() {
        let message = this.props.item;
        let classes = "one-message ";
        
        classes += (message.partner)? 'from-partner' : 'from-user';

        return classes;
    }

    getMessage() {
        let message = this.props.item;

        if (!message.value){
            return;
        }

        let urls = message.value.match(urlRegex);
        let txts;
        if (urls){
            let msg = message.value
            txts = [];
            for (let j in urls){
                let tmp = msg.split(urls[j]);
                txts.push(tmp[0]);
                msg = tmp[1];
            }
            txts.push(msg);
        }

        let content = [];

        if (txts && urls){
            for (var i in txts){
                content.push(txts[i]);
                content.push(
                    <a href={ urls[i] } key={ i } rel="noopener noreferrer" target="_blank" className="link">
                        { urls[i] }
                    </a>
                );
            }
        } else {
            content.push(message.value);
        }

        return (
            <span>
                { content }
            </span>
        );
    }

    getTime() {
        let message = this.props.item;

        let date = time.Moment((new Date()).setTime(message.date));
        return date.format('LT');
    }

    getTooltipData() {
        let message = this.props.item;

        let data = {
            tooltip     : (<Tooltip id="tooltip">{ this.getTime() }</Tooltip>),
            placement   : (message.partner)? 'right' : 'left'
        }

        return data;
    }

    buildFiles(files) {

        let data = [];

        for (let i in files){
            let file = files[i];
            if (file && typeof file === 'object'){
                data.push(
                    <OneFileView
                        file={ file }
                        key={ i }
                        multi
                    />
                );
            } else {
                data.push(
                    <div 
                        className="file-processing"
                        file={ file }
                        key={ i }
                    >
                        <Loader />
                    </div>
                );
            }
        }

        return data;
    }

    messageFiles() {
        let message = this.props.item;

        if (!message.files){
            return null;
        }

        return (
            <div className="message-files">
                { this.buildFiles(message.files) }
            </div>
        );
    }

    render() {

        let data = this.getTooltipData();

        return (
            <div className={ this.getClasses() }>
                <OverlayTrigger placement={ data.placement } overlay={ data.tooltip}>
                    <div className="one-message-container">
                        { this.getMessage() }
                        { this.messageFiles() }
                    </div>
                </OverlayTrigger>
            </div>
        );

    }
}
