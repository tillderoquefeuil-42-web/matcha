import React from 'react';

import { Component } from '../Component';
import { OneFileView } from '../images/Dropzone';
import { SuperModal } from '../modal/CustomModal';
import { TagsInput } from '../tagsInput/TagsInput';
import { ProgressCircle } from '../progressCircle/ProgressCircle';
import { Loader } from '../loader/Loader';

import trans from '../../translations/translate';
import utils from '../../utils/utils.js';


export class ExtendedProfile extends SuperModal {

    componentDidMount() {
        this._isMounted = true;
        this.header = false;
        this.footer = false;

        this.state = {
            match   : null,
            show    : false,
            contact : false,
            disabled: false
        };

        this.socket = this.props._g.socket;

        let _this = this;

        this.socket.off('LOAD_EXTENDED_PROFILE').on('LOAD_EXTENDED_PROFILE', function(data){
            if (!data.match){
                return;
            }

            _this.updateMatchRelation(data.match)
            _this.setState({
                match   : data.match,
                contact : data.contact,
                disabled: data.disabled,
                show    : true
            });
        });

        this.socket.off('UPDATE_ONE_MATCH').on('UPDATE_ONE_MATCH', function(data){
            if (!data.match){
                return;
            }

            _this.setState({
                match   : data.match
            });
        });

    }

    componentDidUpdate() {
        document.removeEventListener("keyup", this.handleExtendedKeyPress);

        if (this.state && this.state.show){
            document.addEventListener("keyup", this.handleExtendedKeyPress);
            this.updateMatchRelation(this.state.match);
        }
    }

    onClose = e => {
        this.handleClose();
    }

    handleClose() {
        this.setState({
            match   : null,
            contact : false,
            show    : false
        });

        utils.resetPicturesDisplay();
    }

    handleExtendedKeyPress = e => {
        let arrows = ['Escape'];

        if (!this.state.show || arrows.indexOf(e.key) === -1){
            return;
        }

        this.handleClose();
    }

    handleLike = e => {
        let liked = (!this.hasLiked());

        let data = {
            like        : liked,
            partner_id  : this.state.match._id
        }

        this.socket.emit('UPDATE_LIKE_STATE', data);
    }

    handleChat = e => {
        this.socket.emit('SELECT_ONE_CHAT', {
            partner_id  : this.state.match._id,
            status      : 'footer_chat',
            force       : true
        });
        this.handleClose();
    }

    handleBlock = e => {
        let data = {
            partner_id  : this.state.match._id
        }

        this.socket.emit('BLOCK_MATCH_RELATION', data);
        this.handleClose();
    }

    handleReport = e => {
        let data = {
            partner_id  : this.state.match._id
        }

        if (window.confirm(trans.get('USER.DISCLAIMER.REPORT'))){
            this.socket.emit('REPORT_MATCH_RELATION', data);
            this.handleClose();
        }
    }

    updateMatchRelation(partner) {
        if (partner){
            return;
        }

        let partner_id = partner._id;

        if (!partner || (partner.match_relation && partner.match_relation.p_has_seen)){
            return;
        }

        let data = {
            partner_id  : partner_id
        }

        this.socket.emit('UPDATE_MATCH_RELATION', data);
    }

    hasLiked() {
        let partner = this.state.match;

        if (partner && partner.match_relation && partner.match_relation.p_has_liked){
            return true;
        }

        return false;
    }

    hasBeenLiked() {
        let partner = this.state.match;

        if (partner && partner.match_relation && partner.match_relation.u_has_liked){
            return true;
        }

        return false;
    }

    getAge(match) {
        return (
            <span>
                { match.age + trans.get('UNITS.AGE') }
            </span>
        );
    }

    getDistance(match) {
        let distance = Math.round(match.distance / 1000);
        if (!distance){
            distance = '<1'
        }

        distance += trans.get('UNITS.KM');

        return (
            <span>
                | { distance }
            </span>
        );
    }

    getRate(match) {
        if (!match.rate){
            return;
        }

        return (
            <span title={ trans.get('USER.FIELDS.POPULARITY') + ` (${match.rate}%)` }>
                | <ProgressCircle value={ match.rate } small/>
            </span>
        );
    }

    getBasicsInfos(match){
        return (
            <span>
                { this.getAge(match) }
                { this.getDistance(match) }
                { this.getRate(match) }
            </span>
        );
    }

    getDotsList(){
        let list = [];

        if (this.state.contact){
            list.push({
                label   : trans.get('CHAT.SEND_MESSAGE'),
                onClick : this.handleChat
            });
        }

        list.push({
            label   : trans.get('USER.FIELDS.BLOCK'),
            onClick : this.handleBlock
        }, {
            label   : trans.get('USER.FIELDS.REPORT'),
            onClick : this.handleReport
        });

        return list;
    }

    buildFile() {

        let match = this.state.match;
        if (match){
            return <img src={ utils.getFileUrl(match.profile_pic) } alt="" />
        }

        return null;
    }

    buildFiles() {
        let match = this.state.match;
        if (!match){
            return null;
        }

        let data = [];
        for (let i in match.pictures){
            data.push(
                <OneFileView
                    file={ match.pictures[i] }
                    key={ i }
                    multi
                />
            );
        }

        return data;
    }

    buildInfos() {
        let match = this.state.match;
        if (!match){
            return null;
        }

        return (
            <div className="profile-infos-display">

                <div>

                    <div className="icons-container">
                        <LikeIcon
                            hasLiked={ this.hasLiked() }
                            hasBeenLiked={ this.hasBeenLiked() }
                            disabled={ this.state.disabled }
                            onClick={ this.handleLike }
                        />

                        <DotsIcon
                            list={ this.getDotsList() }
                        />
                    </div>

                    <div className="profile-identity">
                        <b>{ match.firstname }</b>
                        { this.getBasicsInfos(match) }
                    </div>

                    <TagsInput
                        tags={ match.tags }
                        readOnly
                    />

                    <p className="profile-bio">
                        { match.bio }
                    </p>
                </div>

                <div className="profile-pictures">
                    { this.buildFiles() }
                </div>

            </div>
        );
    }

    buildClose() {
        return null;
    }

    buildbody() {

        if (!this.state || !this.state.match){
            return (
                <div className="center">
                    <Loader />
                </div>
            );
        }

        return(
            <div id="extended-profile">
                { this.buildClose() }

                <div className="profile-pic">
                    { this.buildFile() }
                </div>

                <div className="profile-info">
                    { this.buildInfos() }
                </div>

            </div>
        );
    }

}

class LikeIcon extends Component {

    hasLiked() {
        let classes = 'left-half vertical-split';

        if (this.props.hasLiked){
            classes += ' active';
        }

        if (!this.props.disabled){
            classes += ' c-pointer';
        }

        return classes;
    }

    hasBeenLiked() {
        let classes = 'right-half vertical-split';

        if (this.props.hasBeenLiked){
            classes += ' active'
        }
        return classes;
    }

    handleClick = e => {
        if (this.props.disabled || !this.props.onClick){
            return;
        }

        this.props.onClick(e);
    }

    render() {
        return (
            <div className="like-icon">
                <div className={ this.hasLiked() } onClick={ this.handleClick } title={ trans.get('USER.FIELDS.LIKE') }>
                    <div className="top-half horizontal-split">
                        <i className="far fa-heart"></i>
                    </div>
                    <div className="bottom-half horizontal-split">
                        <i className="far fa-heart"></i>
                    </div>
                </div>
                <div className={ this.hasBeenLiked() } title={ trans.get('USER.FIELDS.BEEN_LIKE') }>
                    <div className="top-half horizontal-split">
                        <i className="far fa-heart"></i>
                    </div>
                    <div className="bottom-half horizontal-split">
                        <i className="far fa-heart"></i>
                    </div>
                </div>
            </div>
        );
    }

}

class DotsIcon extends Component {

    constructor(props){
        super(props);

        this.state = {
            show    : false
        };
    }

    toggleShow = e => {
        this.setState({show:(!this.state.show)});
    }

    getClasses() {
        let classes = 'dots-menu';

        if (!this.state.show){
            classes += ' no-display';
        }

        return classes;
    }

    buildList() {
        let list = [];

        let elements = this.props.list;
        for (let i in elements){
            let elem = elements[i];
            list.push(
                <li
                    key={ i }
                    onClick={ elem.onClick }
                >
                    { elem.label }
                </li>
            );
        }

        return list;
    }

    upTo(element, oneClass) {
        while (element && element.parentNode) {
            if (element.className && element.className.split(' ').indexOf(oneClass) !== -1) {
                return element;
            }

            element = element.parentNode;
        }
        return null;
    }

    handleMouseDown = event => {
        if (this.state.show && !this.upTo(event.toElement, 'dots-menu')){
            this.toggleShow();
        }
    }

    render() {

        document.removeEventListener('mousedown', this.handleMouseDown);
        if (this.state.show){
            document.addEventListener('mousedown', this.handleMouseDown);
        }

        return (
            <div className="dots-icon" onClick={ this.toggleShow } >
                <i className="fas fa-ellipsis-v"></i>
                <div className={ this.getClasses() }>
                    <ul>
                        { this.buildList() }
                    </ul>
                </div>
            </div>
        );
    }
}
