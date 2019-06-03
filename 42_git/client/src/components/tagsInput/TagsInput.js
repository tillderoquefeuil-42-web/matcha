import React from 'react';
import { Badge } from "react-bootstrap";

import { Component } from '../Component';
import { SearchBar } from '../searchBar/SearchBar';
import { Loader } from '../loader/Loader';

import utils from '../../utils/utils';
import trans from '../../translations/translate';

import './tagsinput.css';

export class TagsInput extends Component {

    constructor(props){
        super(props);

        this.state = {
            current     : '',
            collection  : null,
            selected    : props.tags || []
        };
    }

    componentDidMount() {
        this._isMounted = true;

        let _this = this;

        utils.getTags()
        .then(function(tags){
            _this.setState({collection : tags});
        });
    }

    updateSelection(tags) {
        this.setState({selected:tags});

        let collection = this.filterCollection(tags);
        this.searchbar.updateCollection(collection)

        this.props.onChange(tags);
    }

    sortTags(a, b){
        return (a.label <= b.label? -1 : 1);
    }

    handleSelect = (event, items) => {
        this.addTags(items);
    }

    addTags(items) {

        let tags = this.state.selected || [];

        for (let i in items){
            let tag = typeof items[i] === 'string'? items[i] : items[i].label;

            tag = utils.slugify(tag, ' ');

            if (tag && tags.indexOf(tag) === -1){
                tags.push(tag);
            }
        }

        this.updateSelection(tags);
        this.setState({current:''});
    }

    handleRemove = (event, i) => {
        this.deleteOneTag(i);
    }

    deleteOneTag(i){

        let tags = this.state.selected || [];

        if (tags[i]){
            tags.splice(i, 1);
            this.updateSelection(tags);
        }
    }

    getValue() {
        let tags = this.state.selected || [];
        tags.sort();

        let value = [];
        for (let i in tags){
            value.push(this.buildOneTag(tags[i], i));
        }

        return value;
    }

    buildOneTag(tag, key) {

        if (this.props.readOnly){
            return (
                <Badge className="badge-info" key={ key }>
                    { tag }
                </Badge>
            );
        }

        return (
            <Badge className="badge-info deletable" key={ key } onClick={ (e) => this.handleRemove(e, key) }>
                { tag }
                <span className="badge-remove fa fa-times"></span>
            </Badge>
        );
    }

    filterCollection(tags) {

        let filtred = [];
        let c = this.state.collection || [];

        for (let i in c){
            let label = c[i].label;

            if (tags.indexOf(label) === -1){
                filtred.push(c[i]);
            }
        }

        return filtred;
    }

    buildSearchBar() {

        if (this.props.readOnly){
            return null;
        }

        if (this.state.collection){
            let tags = this.state.selected || [];
            let collection = this.filterCollection(tags);

            return (
                <div className="input">
                    <SearchBar
                        ref={ el => this.searchbar = el }
                        collection={ collection }
                        placeholder={ trans.get('USER.FIELDS.ADD_TAG') }
                        onSelect={ (event, items) => this.handleSelect(event, items) }
                        onCreate={ (value) => this.addTags([value]) }
                        sort={ (a, b) => this.sortTags(a, b) }
                        multiSelect
                        resetValue
                    />
                </div>
            );
        }

        return (
            <div className="center">
                <Loader />
            </div>
        );
    }

    render() {

        return (
            <div className="tags-input">

                { this.buildSearchBar() }

                <div className="tags">
                    { this.getValue() }
                </div>
            </div>
        );
    }
}