import React from 'react';

import './loader.css';


export class Loader extends React.Component {

    render() {

        return (
            <div>
                <i className="fa fa-10x fa-circle-notch fa-spin"></i>
            </div>
        );
    }

}