import React from 'react';

import {Gmaps, Marker} from 'react-gmaps';

import Location from '../../utils/location';
import trans from '../../translations/translate';

import './gmap.css';

const coords = {
    lat : 48.85340440403773,
    lng : 2.3487839388235443
};

export class Gmap extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            width   : props.width || 500,
            height  : props.height || 500,
            zoom    : props.zoom || 10
        }

        this.onDragEnd.bind(this);

        window.gLocation = Location;
    }


    onMapCreated(map) {
        map.setOptions({
            disableDefaultUI: true
        });
    }

    onDragEnd = (e) => {
        // console.log('onDragEnd', e);
        let geocodes = e.latLng;
        let _this = this;

        Location.getAddressFromGeocode(geocodes.lat(), geocodes.lng())
        .then(response => {
            if (response && response.status === 'OK' && response.results.length > 0){
                let location = Location.parseAddress(response.results[0]);
                _this.props.onSelect(location);
            }
        });
    }

    render() {
        return (
            <Gmaps
                lat={ coords.lat }
                lng={ coords.lng }
                params={ Location.getParams() }
                zoom={ this.state.zoom }
                width={ this.state.width }
                height={ this.state.height }
                loadingMessage={ trans.get('COMMON.LOADING') }
                onMapCreated={ this.onMapCreated }
            >
                <Marker
                    lat={ coords.lat }
                    lng={ coords.lng }
                    draggable={ true }
                    onDragEnd={ this.onDragEnd }
                />
            </Gmaps>
        );
    }

}