import React from 'react';

import { Places } from './Places';

// import Location from '../../utils/location';
// import trans from '../../translations/translate';

import './gmap.css';

export class Gplaces extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            places  : null
        };
    }

    onPlacesLoaded(places) {
        this.setState({places : places});

        if (this.props.onLoaded){
            this.props.onLoaded();
        }
    }

    initOptions() {
        return ({
            types   : ['geocode']
        });
    }

    render() {
        return (

            <div>
                <div className="center">
                    <Places
                        id="gmap-places"
                        options={ this.initOptions() }
                        onPlacesLoad={ places => this.onPlacesLoaded(places) }
                    />
                </div>
            </div>
        );
    }


}
