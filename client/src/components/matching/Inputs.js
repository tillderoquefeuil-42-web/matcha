import React from 'react';
import { FormGroup, ControlLabel } from 'react-bootstrap';

import { Component } from '../Component';
import { OneFileView } from '../images/Dropzone';
import { Slider, Range } from '../slider/Slider';
import { SuperModal } from '../modal/CustomModal';
import { TagsInput } from '../tagsInput/TagsInput';
import { ProgressCircle } from '../progressCircle/ProgressCircle';

import trans from '../../translations/translate';
import utils from '../../utils/utils.js';


const distanceUnit = trans.get('UNITS.KM');

const defaultParams = {
    distance    : {
        default : 50,
        min     : 1,
        max     : 250,
        marks   : {
            1   : <strong>{ 1 + distanceUnit }</strong>,
            50 : '50' + distanceUnit,
            100 : '100' + distanceUnit,
            150 : '150' + distanceUnit,
            200 : '200' + distanceUnit,
            250 : <strong>{ 250 + distanceUnit }</strong>
        },
    },
    age         : {
        min     : 16,
        max     : 100,
        marks   : {
            18  : <strong>18</strong>,
            25  : '25',
            40  : '40',
            55  : '55',
            70  : '70',
            85  : '85',
            99  : <strong>99</strong>
        },
    },
    popularity  : {
        min     : 0,
        max     : 5,
        marks   : {
            0   : '0',
            1   : '1',
            2   : '2',
            3   : '3',
            4   : '4',
            5   : '5',
        },
    }
}

export class Distance extends Component {

    render() {

        let value = (this.props.value !== null)? this.props.value : defaultParams.distance.default;

        return (
            <FormGroup controlId="distance">
                <ControlLabel>{ trans.get('USER.FIELDS.DISTANCE') }</ControlLabel>
                <Slider
                    step={ 1 }
                    min={ defaultParams.distance.min }
                    max={ defaultParams.distance.max }
                    marks={ defaultParams.distance.marks }
                    value={ value }
                    handleChange={ this.props.onChange }
                />
            </FormGroup>
        );
    }
}

export class Age extends Component {

    render() {
        let value = (this.props.value !== null)? this.props.value : [defaultParams.age.min, defaultParams.age.max];

        return (
            <FormGroup controlId="age">
                <ControlLabel>{ trans.get('USER.FIELDS.AGE') }</ControlLabel>
                <Range
                    step={ 1 }
                    min={ defaultParams.age.min }
                    max={ defaultParams.age.max }
                    marks={ defaultParams.age.marks }
                    value={ value }
                    handleChange={ this.props.onChange }
                />
            </FormGroup>
        );
    }
}

export class Popularity extends Component {

    render() {
        let value = (this.props.value !== null)? this.props.value : [defaultParams.popularity.min, defaultParams.popularity.max];

        return (
            <FormGroup controlId="popularity">
                <ControlLabel>{ trans.get('USER.FIELDS.POPULARITY') }</ControlLabel>
                <Range
                    step={ 1 }
                    min={ defaultParams.popularity.min }
                    max={ defaultParams.popularity.max }
                    marks={ defaultParams.popularity.marks }
                    value={ value }
                    handleChange={ this.props.onChange }
                />
            </FormGroup>
        );
    }
}

export class ExtendedProfile extends SuperModal {

    componentDidMount() {
        this._isMounted = true;
        this.header = false;
        this.footer = false;

        this.socket = this.props._g.socket;
    }

    componentDidUpdate() {
        if (this.props.show){
            document.addEventListener("keyup", this.handleExtendedKeyPress);
            this.updateMatchRelation();
        } else {
            document.removeEventListener("keyup", this.handleExtendedKeyPress);
        }
    }

    handleExtendedKeyPress = e => {
        let arrows = ['Escape'];

        if (!this.props.show || arrows.indexOf(e.key) === -1){
            return;
        }

        this.props.onClose();
    }

    handleLike = e => {
        let liked = (!this.hasLiked());

        let data = {
            like        : liked,
            partner_id  : this.props.match._id
        }

        this.socket.emit('UPDATE_LIKE_STATE', data);
    }

    handleChat = e => {
        let data = {
            partner_id  : this.props.match._id
        }

        this.socket.emit('OPEN_MATCH_CONV', data);
    }

    handleBlock = e => {
        let data = {
            partner_id  : this.props.match._id
        }

        this.socket.emit('BLOCK_MATCH_RELATION', data);
        this.props.onClose();
    }

    handleReport = e => {
        let data = {
            partner_id  : this.props.match._id
        }

        if (window.confirm(trans.get('USER.DISCLAIMER.REPORT'))){
            this.socket.emit('REPORT_MATCH_RELATION', data);
            this.props.onClose();
        }
    }

    updateMatchRelation() {
        let partner = this.props.match;
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
        let partner = this.props.match;

        if (partner && partner.match_relation && partner.match_relation.p_has_liked){
            return true;
        }

        return false;
    }

    hasBeenLiked() {
        let partner = this.props.match;

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

        if (this.props.contact){
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

        let match = this.props.match;
        if (match){
            return <img src={ utils.getFileUrl(match.profile_pic) } alt="" />
        }

        return null;
    }

    buildFiles() {
        let match = this.props.match;
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
        let match = this.props.match;
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

export class OneProfile extends Component {

    render() {
        
        let match = this.props.match

        if (!match){
            return null;
        }

        return (
            <div
                className="one-profile"
                onClick={ () => this.props.onSelect(match._id) }
            >

                <div className="profile-pic">
                    <img src={ utils.getFileUrl(match.profile_pic) } alt="" />
                </div>

                <h1>{ match.firstname }</h1>
                <span>{ match.age }</span>
            </div>
        );
    }

}

class LikeIcon extends Component {

    hasLiked() {
        let classes = 'left-half vertical-split';

        if (this.props.hasLiked){
            classes += ' active'
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

    render() {
        return (
            <div className="like-icon">
                <div className={ this.hasLiked() } onClick={ this.props.onClick } title={ trans.get('USER.FIELDS.LIKE') }>
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
