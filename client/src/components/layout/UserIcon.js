import React from 'react';

import utils from '../../utils/utils';
import trans from '../../translations/translate';

export class UserIcon extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            user    :   props._g? props._g.user : props.user
        }

        this.socket = props._g? props._g.socket : null;
    }

    componentDidMount() {
        let _this = this;

        if (this.socket){
            this.socket.on('PROFILE_PICTURE_UPDATE', function(data){
                _this.setState({user:data.user});
            });
        }
    }

    handleClick = e => {
        if (!this.props.showProfile || !this.props._socket){
            return;
        }

        utils.getExtendedProfile(this.props._socket, {
            partner_id  : this.state.user._id,
            disabled    : true
        });
    }

    getClasses() {
        let classes = 'user-profile-picture';

        if (this.props.showProfile && this.props._socket){
            classes += ' c-pointer';
        }

        return classes;
    }

    render(){
        let user = this.state.user;

        if (user && user.main_picture){

            return (
                <div className="user-profile-picture">
                    <img
                        alt=""
                        src={ utils.getFileUrl(user.main_picture) }
                        className={ this.getClasses() }
                        onClick={ this.handleClick }
                    />
                </div>
            );
        }

        return (
            <i className="far fa-user user-default-icon" title={ trans.get('TABS.ACCOUNT') }></i>
        );
    }
}