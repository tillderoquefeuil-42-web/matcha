import React from 'react';

import { Gmap } from '../gmap/Gmap';
import { Gplaces } from '../gmap/Gplaces';

import utils from '../../utils/utils';
import trans from '../../translations/translate';

export class Location extends React.Component {

    constructor(props){
        super(props);

        let user = utils.getLocalUser();
        let location = user.location || {label:''};

        this.state = {
            location : location,
            address  : location.label
        }
    }

    getMapWidth() {
        let width = window.innerWidth;

        if (width > 991){
            return (Math.round(width/3.15));
        }

        return (width - 250);
    }

    handleSelect = location => {
        console.log(location);

        this.setState({
            location    : location,
            address     : location.label
        });

        this.gplaces.updateAddress(location.label);
    }

    render() {
        return (
            <div id="location" className="account-block">
                <h2 className="form-section">{ trans.get('USER.LOCATION') }</h2>

                <Gplaces
                    ref={ (elem) => this.gplaces = elem }
                />

                <div className="center">

                    <Gmap
                        height={ 400 }
                        width={ this.getMapWidth() }
                        onSelect={ (location) => this.handleSelect(location) }
                    />
                </div>
            </div>
        );
    }

}