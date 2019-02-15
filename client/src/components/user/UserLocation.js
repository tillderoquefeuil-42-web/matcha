import React from 'react';

import { Button } from 'react-bootstrap';

import { Gmap } from '../gmap/Gmap';
// import { Gplaces } from '../gmap/Gplaces';

import utils from '../../utils/utils';
import Location from '../../utils/location';
import trans from '../../translations/translate';

export class UserLocation extends React.Component {

    constructor(props){
        super(props);

        let user = utils.getLocalUser();
        let location = user.location || {label:''};

        this.state = {
            location    : location,
            address     : location.label,
            disclaimer  : false
        }

        window._location = Location;

    }

    getMapWidth() {
        let width = window.innerWidth;

        if (width > 991){
            return (Math.round(width/3.15));
        }

        return (width - 250);
    }

    onMapLoaded() {
        this.userGeolocation();
    }

    userGeolocation() {
        let _this = this;
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
              _this.addMarker(position.coords.latitude, position.coords.longitude);
          }, function() {
              _this.setState({disclaimer:true});
              _this.new_disclaimer = true;
              Location.geolocate()
              .then(response => {
                  if (response.data && response.data.location){
                      _this.addMarker(response.data.location.lat, response.data.location.lng);
                  }
              }).catch(err => {
                  console.warn('Error: The Geolocation service failed.');
              });
          });
        } else {
              console.warn('Error: Your browser doesn\'t support geolocation.');
        }
    }

    addMarker(lat, lng) {
        const params = {
            draggable   : true,
            focus       : true,
            lat         : lat,
            lng         : lng,
            onDragEnd   : this.onDragEnd
        };

        this.gmap.addMarker(params);

        this.getLocationFromGeocode(lat, lng);
    }

    onDragEnd = (e) => {
        let geocodes = e.latLng;
        this.getLocationFromGeocode(geocodes.lat(), geocodes.lng());
    }

    getLocationFromGeocode(lat, lng) {
        let _this = this;
        Location.getAddressFromGeocode(lat, lng)
        .then(response => {
            if (response && response.status === 'OK' && response.results.length > 0){
                let location = Location.parseAddress(response.results[0]);
                _this.updateLocation(location);
            }
        });
    }

    disclaimer() {

        if (this.state.disclaimer){
            return (
                <i className="text-danger">{ trans.get('USER.DISCLAIMER.ADDRESS_ESTIMATION') }</i>
            );
        }

        return null;
    }

    updateLocation(location){
        if (this.new_disclaimer){
            this.new_disclaimer = false;
        } else if (this.state.disclaimer) {
            this.setState({disclaimer:false});
        }

        console.log(location);
        this.setState({location:location});
    }

    saveLocation() {
        let location = this.state.location;

        if (!location){
            return;
        }

        console.log(location);
    }

    // handleSelect = location => {
    //     console.log(location);

    //     this.setState({
    //         location    : location,
    //         address     : location.label
    //     });

    //     this.gplaces.updateAddress(location.label);
    // }

    render() {
        return (
            <div id="location" className="account-block">
                <h2 className="form-section">{ trans.get('USER.LOCATION') }</h2>

                <Gmap
                    ref={ el => this.gmap = el }
                    width={ this.getMapWidth() }
                    height={ 400 }
                    onLoaded={ () => this.onMapLoaded() }
                />

                <div className="disclaimer">
                    <i>{ trans.get('USER.DISCLAIMER.PRIVATE_LOCATION') }</i>
                    { this.disclaimer() }
                </div>

                <Button
                    onClick={ () => this.saveLocation() }
                    block
                    bsStyle="primary"
                    bsSize="large"
                    className="save-user-location"
                >
                    { trans.get('BUTTON.SAVE') }
                </Button>

            </div>
        );
    }

}