import React from 'react';

export class Component extends React.Component {

    _isMounted = false;

    _setState = this.setState;

    setState = function(params){
        if (this._isMounted){
            this._setState(params);
        }
    }

    componentWillUnmount() {
        // console.log('unmount');
        this._isMounted = false;
    }

    componentDidMount() {
        // console.log('mount');
        this._isMounted = true;
    }

}