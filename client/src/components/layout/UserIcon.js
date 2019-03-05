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

    render(){
        let user = this.state.user;

        if (user && user.profile_pic){

            return (
                <div className="user-profile-picture">
                    <img src={ utils.getFileUrl(user.profile_pic) } alt="" />
                </div>
            );
        }

        return (
            <i className="fas fa-user" title={ trans.get('TABS.ACCOUNT') }></i>
        );
    }
}