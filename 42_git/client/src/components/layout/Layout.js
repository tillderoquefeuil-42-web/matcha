
import React from 'react';
import io from "socket.io-client";

import { Header } from './Header';
import { Main } from './Main';
import { FooterChat } from '../chat/FooterChat';

import './layout.css';

export class Layout extends React.Component {

    constructor(props){
        super(props);

        let page = 'home';
        if (props.page){
            page = props.page;
        }

        if (props.user && (!props.user.gender || !props.user.profile_pic)){
            page = 'account';
        }

        let socket = io('http://localhost:8000', {
            query   : {
                _token  : (localStorage.getItem('token')? localStorage.getItem('token') : "")
            }
        });

        this.state = {
            page    : page,
            socket  : socket,
            params  : props.params,
            user    : props.user
        };

        this.pageChange.bind(this);
    }

    pageChange(name){
        this.setState({page:name});
    }

    getClasses() {

        let classes = 'g-layout';

        if (this.state.page){
            classes += ' page-' + this.state.page;
        }

        return classes;
    }

    footerChat() {
        if (this.state.page === 'chat'){
            return null;
        }

        return (
            <FooterChat
                _g={ this.state }
            />
        );
    }

    render() {
        return(
            <div id="layout" className={ this.getClasses() }>
                <Header
                    _g={ this.state }
                    pageChange={ (name)=> {this.pageChange(name)} }
                />

                <Main
                    _g={ this.state }
                />

                { this.footerChat() }

            </div>
        );
    }
}