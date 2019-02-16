import React from 'react';

import Location from '../../utils/location';

export class Places extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            id  : props.id || 'gmap-autocomplete'
        }

        this.onScriptLoad = this.onScriptLoad.bind(this);
    }

    onScriptLoad() {
        const autocomplete = new window.google.maps.places.Autocomplete(
            document.getElementById(this.state.id),
            this.props.options
        );

        this.props.onPlacesLoad(autocomplete);
    }

    loadGoogleMapsAPI(){
        let _this = this;
        Location.loadGoogleMapsAPI(function(e){
            _this.loadGooglePlacesAPI();
        });
    }

    loadGooglePlacesAPI(){
        let _this = this;
        Location.loadGooglePlacesAPI(function(e){
            _this.onScriptLoad();
        });
    }

    componentDidMount() {
        if (!window.google) {
            this.loadGoogleMapsAPI()
        } else if (window.google && !window.google.maps.places) {
            this.loadGooglePlacesAPI()
        } else {
            this.onScriptLoad();
        }
    }

    render() {
        return (
            <input
                id={ this.state.id }
                type="text"
            />
        );
    }
}