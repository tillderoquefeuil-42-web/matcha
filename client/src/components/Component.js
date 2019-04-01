import React from 'react';

export class Component extends React.Component {

    _isMounted = false;

    _setState = this.setState;

    setState = function(params){
        if (this._isMounted){
            this._setState(params);
            if (this._log){
                console.log('setState (DONE)');
            }
        } else if (this._log){
            console.log('setState (CANCELED');
        }
    }

    componentWillUnmount() {
        if (this._log){
            console.log('unmount');
        }
        this._isMounted = false;
    }

    componentDidMount() {
        if (this._log){
            console.log('mount');
        }
        this._isMounted = true;
    }

}