import React from 'react';

import { Component } from '../Component';
import Location from '../../utils/location';

export class Map extends Component {

    constructor(props) {
        super(props);

        this.onScriptLoad = this.onScriptLoad.bind(this);
    }

    componentDidMount() {
        this._isMounted = true;

        if (!window.google) {
            this.loadGooglePlacesAPI()
        } else {
            this.onScriptLoad();
        }
    }

    loadGooglePlacesAPI(){
        let _this = this;
        Location.loadGooglePlacesAPI(function(e){
            _this.onScriptLoad();
        });
    }

    onScriptLoad() {
        if (!this._isMounted){
            return;
        }

        let data = {};

        if (this.props.map){
            data.map = new window.google.maps.Map(
                document.getElementById(this.props.map),
                this.props.options.map
            );
        }

        if (this.props.autocomplete){
            data.autocomplete = new window.google.maps.places.Autocomplete(
                document.getElementById(this.props.autocomplete),
                this.props.options.places
            );
            data.autocomplete.setFields(['address_components', 'formatted_address', 'geometry']);
        }

        this.props.onLoad(data);
    }

    forceAutocomplete(address) {

        if (!this.props.autocomplete){
            return;
        }

        this.places_input.value = address;
    }

    buildAutocomplete(){
        if (!this.props.autocomplete){
            return null;
        }

        return (
            <input
                type="text"
                className="autocomplete-input form-control"
                id={ this.props.autocomplete }
                ref={ el => this.places_input = el }
            />
        );
    }

    buildMap() {
        if (!this.props.map){
            return null;
        }

        return (
            <div
                id={ this.props.map }
                style={{ height: this.props.height }}
            />
        );
    }

    render() {
        return (
            <div className="gmap">
                { this.buildAutocomplete() }

                { this.buildMap() }
            </div>
        );
    }
}