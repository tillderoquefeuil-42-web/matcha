import React from 'react';
import { FormGroup, FormControl } from "react-bootstrap";

import Location from '../../utils/location';
// import trans from '../../translations/translate';

import './gmap.css';

export class Gplaces extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            address : ''
        };
    }

    componentDidMount(){
        let _this = this;

        let autocomplete = new window.google.maps.places.Autocomplete(
            document.getElementById('gplaces-input'), {types: ['geocode']}
        );

        autocomplete.setFields('address_components');
        autocomplete.addListener('place_changed', function(){
            let place = autocomplete.getPlace();
            let location = Location.parseAddress(place);
            _this.props.onSelect(location);
        });
    }

    // handleChange = event => {
    //     this.updateAddress(event.target.value);
    // }

    updateAddress(address) {
        this.setState({
            address : address
        });
    }

                        // onChange={this.handleChange}
    render() {
        return (
            <div>
                <FormGroup bsSize="large">
                    <FormControl 
                        id="gplaces-input"
                        type="text"
                        value={this.state.address}
                    />
                </FormGroup>
            </div>
        );
    }


}
