import React from 'react';
import { FormGroup, FormControl, InputGroup, Button } from "react-bootstrap";

import utils from '../../utils/utils';
import trans from '../../translations/translate';

import './searchbar.css';

const minItems = 10;

export class SearchBar extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            value       : '',
            collection  : utils.indexCollection(props.collection),
            slugs       : this.createSlugs(props.collection),
            showlist    : false,
            matches     : [],
            count       : this.itemsCount(),
            placeholder : props.placeholder || trans.get('COMMON.SEARCH')
        };

        this.collapse.bind(this);
        this.expand.bind(this);
    }

    componentDidUpdate() {

        if (this.iScroll && !this.iScroll.scrollListener){
            this.iScroll.addEventListener("scroll", () => {
                this.buildMoreElements();
            });
            this.iScroll.scrollListener = true;
        }
    }

    itemsCount() {
        let height = window.innerHeight;

        let count = Math.round(height / 50);
        return (count < minItems? minItems : count);
    }

    buildMoreElements() {

        if ((this.iScroll.scrollTop + this.iScroll.clientHeight >= this.iScroll.scrollHeight) && this.state.length > this.state.count){
            this.setState({count : this.state.count + this.itemsCount()});
        }
    }

    createSlugs(c) {
        let slugs = {};

        for (let i in c){
            let item = c[i];
            let id = item.id || item._id;
            let label = this.getLabel(item);

            slugs[id] = utils.slugify(label);
        }

        return slugs;
    }

    handleSelect = (event, item) => {
        this.setState({
            value   : this.props.resetValue? '' : this.getLabel(item)
        });

        this.collapse();
        this.props.onSelect(event, item);
    }

    handleKeyPress = event => {
        if (!this.props.onCreate){
            return;
        }

        if (event.key === 'Enter'){
            this.props.onCreate(event.target.value);
            if (this.props.resetValue){
                this.preventKeyUpEvent = true;
                this.setState({value : ''});
                this.collapse();
            }
        }
    }

    handleChange = event => {
        this.setState({
            value   : event.target.value
        });
    }

    handleKeyUp = event => {
        let _this = this;

        if (this.preventKeyUpEvent){
            this.preventKeyUpEvent = null;
            return;
        }

        if (event.key === 'Escape'){
            this.collapse();
            return;
        }

        if (!this.timer){
            this.timer = 0;
        }
        clearTimeout(this.timer);

        this.timer = setTimeout(function() {
            _this.autocomplete();
        }, 750);

    }

    handleFocus = event => {
        this.expand();
    }

    getLabel(item) {
        let label;

        if (this.props.getLabel){
            label = this.props.getLabel(item);
        } if (!label){
            label = item.label || item.name || (item.username);
        }

        return label;
    }

    renderItem(item) {
        if (this.props.renderItem){
            return this.props.renderItem(item);
        }

        return this.getLabel(item);
    }

    updateCollection(collection){
        this.setState({
            collection  : utils.indexCollection(collection),
            slugs       : this.createSlugs(collection),
        });
    }

    filterCollection(value) {

        let matches = [];
        let c = this.state.slugs;

        if (!value) {
            return Object.values(this.state.collection);
        }

        let slug = utils.slugify(value);
        let regex = new RegExp(slug, 'g');

        for (let i in c){
            let label = c[i];
            if (label.match(regex)){
                matches.push(this.state.collection[i]);
            }
        }

        return matches;
    }

    getListClass() {
        let classes = 'searchbar-list ';

        if (this.state.showlist){
            classes += 'active ';
        }

        return classes;
    }

    buildMatches() {

        let matches = [];

        for (let i in this.state.matches){
            if (i > this.state.count){
                break;
            }

            let match = this.state.matches[i];

            matches.push(
                <Button
                    className="list-item"
                    onClick={(event) => this.handleSelect(event, match) }
                    key={ i }
                    bsSize="large"
                    block
                >
                    { this.renderItem(match) }
                </Button>
            );
        }

        return matches;
    }

    autocomplete = event => {

        let value = this.state.value;
        let matches = this.filterCollection(value);

        if (this.props.sort){
            let _this = this;
            matches.sort(function(a, b){
                return _this.props.sort(a, b);
            });
        }

        this.setState({
            matches : matches
        });

        if (matches.length){
            this.expand();
        } else {
            this.collapse();
        }

    }

    expand = event => {
        if (!this.state.showlist){
            document.removeEventListener('mousedown', this.handleMouseDown);
            document.addEventListener('mousedown', this.handleMouseDown);
            this.setState({showlist:true});
        }
    }
    
    collapse = event => {
        if (this.state.showlist){
            document.removeEventListener('mousedown', this.handleMouseDown);
            this.setState({showlist:false});
        }
    }

    upTo(element, oneClass) {
        while (element && element.parentNode) {
            element = element.parentNode;
            if (element.className && element.className.split(' ').indexOf(oneClass) !== -1) {
                return element;
            }
        }
        return null;
    }

    handleMouseDown = event => {

        if (!this.upTo(event.toElement, 'searchbar')){
            this.collapse();
        }
    }

    render() {
        return (
            <FormGroup controlId="search" className="searchbar" onFocus={ this.autocomplete }>
                <InputGroup>
                    <InputGroup.Addon>
                        <i className="fa fa-search"></i>
                    </InputGroup.Addon>
                    <FormControl 
                        autoComplete="off"
                        placeholder={ this.state.placeholder }
                        value={ this.state.value } 
                        onChange={ this.handleChange }
                        onKeyUp={ this.handleKeyUp }
                        onKeyPress={ this.handleKeyPress }
                        onFocus={ this.handleFocus }
                    />
                </InputGroup>
                <div className={ this.getListClass() } ref={ (el) => { this.iScroll = el; }}>
                    { this.buildMatches() }
                </div>
            </FormGroup>
        );
    }

}
