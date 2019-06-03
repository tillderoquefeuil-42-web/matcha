import React from 'react';
import { Dropdown, Button } from 'react-bootstrap';

import { Component } from '../Component';

// import utils from '../../utils/utils.js';
// import trans from '../../translations/translate';

import './filter.css';

export class Sorting extends Component {

    constructor(props) {
        super(props);

        this.state = {
            type    : null,
            sort    : null,
            sorts   : null
        }
    }

    componentDidMount() {
        this._isMounted = true;

        let sorts = this.parseSorts(this.props.sorts);
        this.setState({sorts : sorts});

        let index = this.props.defaultValue;
        if (index !== null && this.props.sorts[index]){
            let sort = this.props.sorts[index];
            this.handleChange(sort);
        }
    }

    parseSorts(data) {

        let sorts = [];

        for (let i in data){
            let sort = data[i];

            sort.id = sort.id || i;
            sort.label = sort.label || sort.value;
            sort.key = `${sort.id}_${sort.value}`;

            sorts.push(sort);
        }

        return sorts;
    }

    buildOptions() {

        let sorts = this.state.sorts;

        let options = [];

        for (let i in sorts){
            let sort = sorts[i];

            options.push(
                <Button
                    className="dropdown-item"
                    key={ sort.key }
                    onClick={ (e) => this.handleChange(sort) }
                >
                    { sort.label }
                </Button>
            );
        }

        return options;
    }

    inverseType(type) {
        if (type === 'asc'){
            return 'desc';
        }

        return 'asc';
    }

    handleChange = (sort) => {

        let type = this.state.type || 'asc';
        let oldSort = this.state.sort;

        if (oldSort){
            type = (oldSort.id === sort.id)? this.inverseType(type) : 'asc';
        }

        if (sort.inverse && (!oldSort || oldSort.id !== sort.id)){
            type = this.inverseType(type);
        }

        this.setState({
            sort    : sort,
            type    : type
        });

        this.sortCollection(sort, type);
    }

    sortCollection(sort, type) {

        if (!this.props.collection || !this.props.onSort){
            return;
        }

        let collection = Object.values(this.props.collection);

        if (!collection.length){
            this.handleSort(collection);
            return;
        }

        if (!sort){
            this.handleSort(collection);
            return;
        }

        let label = sort.value;

        collection.sort(function(a, b){
            if (sort.compare){
                return sort.compare(a, b, type);
            } else if (type === 'desc'){
                return (b[label] - a[label]);
            } else {
                return (a[label] - b[label]);
            }
        });

        this.handleSort(collection);
        return collection;
    }

    handleSort(collection) {
        let c = [];

        for (let i in collection){
            c.push(collection[i]._id);
        }

        this.props.onSort(c);
    }


    render() {

        return (
            <Dropdown id="sorting-dropdown" className="sorting-dropdown">
                <Dropdown.Toggle id="dropdown-basic">
                    <i className="fas fa-sort-amount-up"></i>
                </Dropdown.Toggle>

                <Dropdown.Menu>
                    { this.buildOptions() }
                </Dropdown.Menu>
            </Dropdown>
        );
    }

}

// export class Filter extends Component {
// // <i class="fas fa-filter"></i>
// }
