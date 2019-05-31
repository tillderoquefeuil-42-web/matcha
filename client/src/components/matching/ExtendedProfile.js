import React from 'react';

import { ProgressCircle } from '../progressCircle/ProgressCircle';
import { TagsInput } from '../tagsInput/TagsInput';
import { SuperModal } from '../modal/CustomModal';
import { OneFileView } from '../images/Dropzone';
import { Loader } from '../loader/Loader';
import { Online } from '../online/Online';
import { Component } from '../Component';
import { LikeIcon } from './Match';

import trans from '../../translations/translate';
import utils from '../../utils/utils';


export class ExtendedProfile extends SuperModal {

    componentDidMount() {
        this._isMounted = true;
        this.header = false;
        this.footer = false;

        this.state = {
            match   : null,
            show    : false,
            contact : false,
            disabled: false,
        };
        
        this.socket = this.props._g.socket;
        let user = utils.getLocalUser();

        let _this = this;

        this.socket.off('LOAD_EXTENDED_PROFILE').on('LOAD_EXTENDED_PROFILE', function(data){
            if (!data.match){
                return;
            }

            if (!utils.extendedProfileLoaded(data.match)){
                return;
            }

            if (user._id !== data.match._id){
                _this.socket.emit('ADD_MATCH_VISIT', {
                    partner_id  : data.match._id
                });
            }

            _this.updateMatchRelation(data.match)
            _this.setState({
                match   : data.match,
                contact : data.contact,
                disabled: data.disabled,
                show    : true,
                user    : user
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
        if (this.state.user._id === this.state.match._id){
            return;
        }

        let liked = (!this.hasLiked());

        let data = {
            like        : liked,
            partner_id  : this.state.match._id
        }

        this.socket.emit('UPDATE_LIKE_STATE', data);
    }

    handleChat = e => {
        if (this.state.user._id === this.state.match._id){
            return;
        }

        this.socket.emit('SELECT_ONE_CHAT', {
            partner_id  : this.state.match._id,
            status      : 'footer_chat',
            force       : true
        });
        this.handleClose();
    }

    handleBlock = e => {
        if (this.state.user._id === this.state.match._id){
            return;
        }

        let data = {
            partner_id  : this.state.match._id
        }

        this.socket.emit('BLOCK_MATCH_RELATION', data);
        this.handleClose();
    }

    handleReport = e => {
        if (this.state.user._id === this.state.match._id){
            return;
        }

        let data = {
            partner_id  : this.state.match._id
        }

        if (window.confirm(trans.get('USER.DISCLAIMER.REPORT'))){
            this.socket.emit('REPORT_MATCH_RELATION', data);
            this.handleClose();
        }
    }

    updateMatchRelation(partner) {
        if (!partner || (partner.match_relation && partner.match_relation.p_has_seen)){
            return;
        }

        let partner_id = partner._id;

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

    getOnlineStatus(match) {
        if (!match.online){
            return;
        }

        return (
            <span title={ trans.get('USER.FIELDS.ONLINE') }>
                | <Online value={match.online} />
            </span>
        );
    }

    getBasicsInfos(match){
        return (
            <span>
                { this.getAge(match) }
                { this.getDistance(match) }
                { this.getRate(match) }
                { this.getOnlineStatus(match) }
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

                <div className="profile-pic col-md-6 col-sm-12">
                    { this.buildFile() }
                </div>

                <div className="profile-info col-md-6 col-sm-12">
                    { this.buildInfos() }
                </div>

                <div className="clearfix"></div>

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

    handleMouseDown = event => {
        let element = event.toElement? event.toElement : event.srcElement;
        if (this.state.show && !utils.upTo(element, 'dots-menu')){
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