import React from 'react';

import Location from '../../utils/location';

export class Map extends React.Component {
    constructor(props) {
        super(props);

        this.onScriptLoad = this.onScriptLoad.bind(this);
    }

    onScriptLoad() {
        const map = new window.google.maps.Map(
            document.getElementById(this.props.id),
            this.props.options
        );

        this.props.onMapLoad(map);
    }

    componentDidMount() {
        if (!window.google) {
            let s = document.createElement('script');
            s.type = 'text/javascript';
            s.src = `https://maps.google.com/maps/api/js?key=${ Location.getAPIkey() }`;

            let x = document.getElementsByTagName('script')[0];
            x.parentNode.insertBefore(s, x);

            s.addEventListener('load', e => {
                this.onScriptLoad();
            });
        } else {
            this.onScriptLoad();
        }
    }

    render() {
        return (
            <div
                style={{ width: this.props.width, height: this.props.height }}
                id={this.props.id}
            />
        );
    }
}