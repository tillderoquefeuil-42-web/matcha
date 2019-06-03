import React from 'react';
import { Image } from "react-bootstrap";

import './images.css';

export class Img extends React.Component {

    getSrc() {

        let name = (this.props.name? this.props.name : 'error.png');
        return "/images/" + name;
    }

    render() {
        return(
            <div className="img" style={this.props.style}>
                <Image src={this.getSrc()} alt={ this.props.alt } />
            </div>
        );
    }
}