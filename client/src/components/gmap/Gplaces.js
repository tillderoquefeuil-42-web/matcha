import React from 'react';
import { FormGroup, FormControl } from "react-bootstrap";

// import Location from '../../utils/location';
// import trans from '../../translations/translate';

import './gmap.css';

export class Gplaces extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            address : ''
        };
    }

    handleChange = event => {
        this.setState({
            [event.target.id]: event.target.value
        });
    }

    updateAddress(address) {
        this.setState({
            address : address
        });
    }

    render() {
        return (
            <div>
                <FormGroup controlId="address" bsSize="large">
                    <FormControl type="text" value={this.state.address} onChange={this.handleChange} />
                </FormGroup>
            </div>
        );
    }

}
