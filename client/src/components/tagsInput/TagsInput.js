import React from 'react';
import { Badge } from "react-bootstrap";

import { SearchBar } from '../searchBar/SearchBar';
import { Loader } from '../loader/Loader';

import API from '../../utils/API';
import utils from '../../utils/utils';
import trans from '../../translations/translate';

import './tagsinput.css';

export class TagsInput extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            current     : '',
            collection  : null,
            selected    : props.tags || []
        };

    }

    componentDidMount() {
        let _this = this;

        API.getTags()
        .then(function(response){
            let tags = response.data.tags;
            _this.setState({collection : tags});
        }, function(error){
            console.log(error);
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

    handleSelect = (event, item) => {
        this.addOneTag(item.label);
    }

    addOneTag(tag){

        tag = utils.slugify(tag, ' ');
        let tags = this.state.selected || [];

        if (tag && tags.indexOf(tag) === -1){
            tags.push(tag);
            this.updateSelection(tags);
        }

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

        if (this.state.collection){
            let tags = this.state.selected || [];
            let collection = this.filterCollection(tags);

            return (
                <SearchBar
                    ref={ el => this.searchbar = el }
                    collection={ collection }
                    placeholder={ trans.get('USER.FIELDS.ADD_TAG') }
                    onSelect={ (event, item) => this.handleSelect(event, item) }
                    onCreate={ (value) => this.addOneTag(value) }
                    sort={ (a, b) => this.sortTags(a, b) }
                    resetValue
                />
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
                <div className="input">
                    { this.buildSearchBar() }
                </div>
                <div className="tags">
                    { this.getValue() }
                </div>
            </div>
        );
    }
}