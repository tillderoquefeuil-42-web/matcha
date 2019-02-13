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
            collection  : null
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

    sortTags(a, b){
        return (a.label <= b.label? -1 : 1);
    }

    handleChange = event => {
        this.setState({
            current : event.target.value
        });
    }

    handleSelect = (event, item) => {
        this.addOneTag(item.label);
    }

    addOneTag(tag){

        tag = utils.slugify(tag, ' ');
        let tags = this.props.tags || [];

        if (tag && tags.indexOf(tag) === -1){
            tags.push(tag);
            this.props.onChange(tags);
        }

        this.setState({current:''});
    }

    handleRemove = (event, i) => {
        this.deleteOneTag(i);
    }

    deleteOneTag(i){

        let tags = this.props.tags || [];

        if (tags[i]){
            tags.splice(i, 1);
            this.props.onChange(tags);
        }
    }

    getValue() {
        let tags = this.props.tags || [];
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

    buildSearchBar() {

        if (this.state.collection){
            return (
                <SearchBar
                    collection={ this.state.collection }
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