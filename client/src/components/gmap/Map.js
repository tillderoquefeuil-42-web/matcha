import React from 'react';

import Location from '../../utils/location';

export class Map extends React.Component {
    constructor(props) {
        super(props);

        this.onScriptLoad = this.onScriptLoad.bind(this);
    }

    componentDidMount() {
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
        let data = {};

        if (this.props.map){
            data.map = new window.google.maps.Map(
                document.getElementById(this.props.map),
                this.props.options
            );
        }

        if (this.props.autocomplete){
            data.autocomplete = new window.google.maps.places.Autocomplete(
                document.getElementById(this.props.autocomplete),
                this.props.options
            );
        }

        this.props.onLoad(data);
    }

    buildAutocomplete(){
        if (!this.props.autocomplete){
            return null;
        }

        return (
            <input
                id={ this.props.autocomplete }
                type="text"
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
                style={{ width: this.props.width, height: this.props.height }}
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