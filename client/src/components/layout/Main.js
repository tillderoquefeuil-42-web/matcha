
import React from 'react';

import { Chat } from '../chat/Chat';
import { Account } from '../user/Account';
import { Matching } from '../matching/Matching';
import { Matches } from '../matching/Matches';
import { Search } from '../search/Search';
import { History } from '../history/History';
import { Notif } from '../notif/Notif';

import { ExtendedProfile } from '../matching/ExtendedProfile';

import './layout.css';

export class Main extends React.Component {

    loadPage() {

        let page = this.props._g.page
        window.history.replaceState({'/' : page}, null, page)

        switch (page){
            default:
                return (<h1>{ page }</h1>);

            case 'home':
                return (<Matching _g={ this.props._g } />);
            case 'search':
                return (<Search _g={ this.props._g } />);
            case 'matches':
                return (<Matches _g={ this.props._g } />);
            case 'account':
                return (<Account _g={ this.props._g } />);
            case 'chat':
                return (<Chat _g={ this.props._g } />);
            case 'history':
                return (<History _g={ this.props._g } />);
            case 'notifications':
                return (<Notif _g={ this.props._g } />);
        }

    }

    render() {
        return(
            <div id="main">
                <ExtendedProfile
                    _g={ this.props._g }
                    pageChange={ (name)=> {this.props.pageChange(name)} }
                    keyboard={ false }
                />

                { this.loadPage() }
            </div>
        );
    }
}