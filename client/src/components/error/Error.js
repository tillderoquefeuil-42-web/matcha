
import React from 'react';

import { Img } from '../images/Img.js';

import trans from '../../translations/translate';

export class Error extends React.Component {

    style = {
        'margin'    : 'auto',
        'marginTop' : '25px',
        'maxHeight' : '200px',
        'maxWidth'  : '200px'
    };

    render() {
        return(
            <div className="flex-center">
                <div className="error well">

                    <Img name="error.png" style={this.style} />
        
                    <hr />

                    <div>
                        <h1>{ trans.get('ERROR.TITLE') + '! ' + trans.get('ERROR.INTERNAL_ERROR') }...</h1>
                    </div>

                </div>
            </div>
        );
    }
}