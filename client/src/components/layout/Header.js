import React from 'react';
import { Navbar, Nav, NavItem } from "react-bootstrap";

import { Logo } from '../images/Logo';
import { UserIcon } from './UserIcon';
import { ChatIcon } from '../chat/ChatIcon';

import utils from '../../utils/utils';
import API from '../../utils/API';
import trans from '../../translations/translate';
import alert from '../../utils/alert';

import './layout.css';

export class Header extends React.Component {

    constructor(props){
        super(props);

        this.signOut.bind(this);
        this.handleSelect.bind(this);

        this.socket = props._g.socket;

    }

    componentDidMount() {
        let user = utils.getLocalUser();

        this.socket.emit('ONLINE', {
            user_id : user._id
        });
    }

    handleSelect = (eventName) => {
        if (!utils.isDefine(eventName)){
            return;
        }

        let user = utils.getLocalUser();
        let authorized = ['signout', 'account'];
        if (!user.gender && authorized.indexOf(eventName) === -1 ){
            let title = trans.get('WARNING.TITLE');
            let msg = trans.get('WARNING.UNFILLED_PROFILE');
            alert.show({title: title, message: msg, type: 'warning'});
            return;
        }

        switch (eventName){
            default:
                console.warn('functionality isn\'t implemented for now');
                break;
            case 'home':
            case 'matches':
            case 'account':
            case 'chat':
            case 'history':
                if (this.props._g.page === eventName){
                    return;
                }

                this.props.pageChange(eventName);
                break;

            case 'signout':
                this.signOut()
                break;
        }
        return;
    }

    signOut() {
        API.signOut();
        window.location = "/user/sign";
    }

    isActive(name) {
        if (this.props._g.page === name){
            return "active";
        }

        return '';
    }

    render() {
        return(
            <div id="header">

                <Navbar collapseOnSelect fixedTop>
                    <Navbar.Header>
                        <Navbar.Brand>
                            <a id="#brand" href="/">
                                <Logo small />
                                
                                { trans.get('GLOBAL.NAME') }
                            </a>
                        </Navbar.Brand>
                        <Navbar.Toggle />
                    </Navbar.Header>

                    <Navbar.Collapse>
                        <Nav className="mr-auto">
                            <NavItem eventKey="home" onSelect={this.handleSelect} className={ this.isActive('home') } >
                                { trans.get('TABS.HOME') }
                            </NavItem>
                            <NavItem eventKey="matches" onSelect={this.handleSelect} className={ this.isActive('matches') } >
                                { trans.get('TABS.MATCHES') }
                            </NavItem>
                        </Nav>

                        <Nav pullRight>
                            {/* <NavItem eventKey={3} onSelect={this.handleSelect}>
                                <i className="far fa-bell" title="Notifications"></i>
                            </NavItem> */}

                            <NavItem eventKey="history" onSelect={this.handleSelect} className="nav-history">
                                <i className="fas fa-history" title={ trans.get('TABS.HISTORY') }></i>
                            </NavItem>
                            <NavItem eventKey="chat" onSelect={this.handleSelect} className="nav-chat">
                                <ChatIcon _g={ this.props._g } />
                            </NavItem>
                            <NavItem eventKey="account" onSelect={this.handleSelect} className="nav-user-account">
                                <UserIcon _g={ this.props._g } />
                            </NavItem>
                            <NavItem eventKey="signout" onSelect={this.handleSelect}>
                                <i className="fas fa-power-off" title={ trans.get('TABS.SIGN_OUT') }></i>
                            </NavItem>
                        </Nav>
                    </Navbar.Collapse>

                </Navbar>;

            </div>
        );
    }
}