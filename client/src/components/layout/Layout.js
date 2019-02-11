
import React from 'react';
import io from "socket.io-client";

import { Header } from './Header';
import { Main } from './Main';

import './layout.css';

export class Layout extends React.Component {

    constructor(props){
        super(props);

        let page = 'home';
        if (props.page){
            page = props.page;
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

    render() {
        return(
            <div id="layout">
                <Header
                    _g={ this.state }
                    pageChange={ (name)=> {this.pageChange(name)} }
                />

                <Main
                    _g={ this.state }
                />
            </div>
        );
    }
}