import React from 'react';
import { Button } from 'react-bootstrap';

import { Component } from '../Component';
import { Gmap } from '../gmap/Gmap';

import API from '../../utils/API';
import alert from '../../utils/alert';
import utils from '../../utils/utils';
import Location from '../../utils/location';
import trans from '../../translations/translate';

export class UserLocation extends Component {

    constructor(props){
        super(props);

        let user = utils.getLocalUser();

        this.state = {
            location    : user.location,
            disclaimer  : 0
        }

        this.updateFromPlaces.bind(this);
        this.updateFromMap.bind(this);
        this.updateLocation.bind(this);
        this.initAutocomplete.bind(this);
        this.initUserLocation.bind(this);
    }

    onMapLoaded() {
        if (!this.gmap){
            return;
        }

        this.initAutocomplete();
        this.initUserLocation();
    }

    initAutocomplete(){
        let _this = this;
        let autocomplete = this.gmap.state.autocomplete;

        autocomplete.addListener('place_changed', function(){
            _this.updateFromPlaces();
        });
    }

    initUserLocation() {

        if (this.state.location && this.state.location.country){
            this.updateLocation(this.state.location);
            return;
        } else if (this.state.location){
            this.updateFromMap(this.state.location.lat, this.state.location.lng);
            return;
        }

        this.userGeolocation();
    }


    // UPDATE

    updateLocation(location){

        let disclaimer = this.state.disclaimer > 0? this.state.disclaimer - 1 : 0;

        this.setState({
            location    : location,
            disclaimer  : disclaimer
        });

        this.gmap.forceAutocomplete(location.label);
        this.addMarker(location);
    }

    updateFromPlaces() {
        let autocomplete = this.gmap.state.autocomplete;

        let place = autocomplete.getPlace();
        let location = Location.parseAddress(place);

        this.updateLocation(location);
    }

    updateFromMap(lat, lng) {
        let _this = this;

        Location.getAddressFromGeocode(lat, lng)
        .then(response => {
            if (response && response.status === 'OK' && response.results.length > 0){
                let location = Location.parseAddress(response.results[0]);

                _this.updateLocation(location);
            }
        });
    }


    // GEOLOCATION

    userGeolocation() {
        let _this = this;

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
                _this.updateFromMap(position.coords.latitude, position.coords.longitude);
          }, function(){
              _this.geolocateBlocked();
          });
        } else {
            this.geolocateBlocked();
        }
    }

    geolocateBlocked() {
        let _this = this;
        this.setState({disclaimer:2});

        Location.geolocate()
        .then(response => {
            if (response.data && response.data.location){
                _this.updateFromMap(response.data.location.lat, response.data.location.lng);
            }
        }).catch(err => {
            console.warn('Error: The Geolocation service failed.');
        });
    }


    // MAP ACTION

    addMarker(location) {
        const params = {
            draggable   : true,
            focus       : true,
            lat         : location.lat,
            lng         : location.lng,
            onDragEnd   : (e) => {
                let geocodes = e.latLng;
                this.updateFromMap(geocodes.lat(), geocodes.lng());
            }
        };

        this.gmap.removeMarkers();
        this.gmap.addMarker(params);
    }


    // SAVER

    saveLocation() {
        let location = this.state.location;

        if (!location){
            return;
        }

        API.saveUserLocation(location)
        .then(function(data){
            let title = trans.get('SUCCESS.TITLE');
            let msg = trans.get('SUCCESS.DATA_SAVED');
            alert.show({title: title, message: msg, type: 'success'});

            let user = data.data.user;
            utils.setLocalUser(user);
        }, API.catchError);
    }


    // FOR DIRECT RENDERING

    getMapWidth() {
        let width = window.innerWidth;

        if (width > 991){
            return (Math.round(width/3.15));
        }

        return (width - 250);
    }

    disclaimer() {
        if (this.state.disclaimer > 0){
            return (
                <i className="text-danger">{ trans.get('USER.DISCLAIMER.ADDRESS_ESTIMATION') }</i>
            );
        }

        return null;
    }


    // RENDER

    render() {

        return (
            <div id="location" className="account-block">
                <h2 className="form-section">{ trans.get('USER.LOCATION') }</h2>

                <Gmap
                    ref={ el => { this.gmap = el; }}
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