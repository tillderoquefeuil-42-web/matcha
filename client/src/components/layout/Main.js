
import React from 'react';

import { Chat } from '../chat/Chat';
import { Account } from '../user/Account';

import './layout.css';

export class Main extends React.Component {

    loadPage() {

        let page = this.props._g.page

        window.history.replaceState({'/' : page}, null, page)

        switch (page){
            default:
                return (<h1>{ page }</h1>);

            case 'account':
                return (<Account _g={ this.props._g } />);
            case 'chat':
                return (<Chat _g={ this.props._g } />);

        }

    }

    render() {
        return(
            <div id="main">
                { this.loadPage() }
            </div>
        );
    }
}