import React from 'react';
import { FormControl, Badge } from "react-bootstrap";

import utils from '../../utils/utils';
import trans from '../../translations/translate';

import './tagsinput.css';

export class TagsInput extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            current : ''
        };

    }

    handleChange = event => {
        this.setState({
            current : event.target.value
        });
    }

    handleKeyPress = event => {
        if (event.key === 'Enter'){
            this.addOneTag();
        }
    }

    addOneTag(){

        let tag = utils.slugify(this.state.current, ' ');
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

    render() {

        return (
            <div className="tags-input">
                <div className="input">
                    <FormControl
                        type="text"
                        placeholder={ trans.get('ADD.A.TAG') }
                        value={ this.state.current }
                        onChange={ this.handleChange }
                        onKeyPress={ this.handleKeyPress }
                    />
                </div>
                <div className="tags">
                    { this.getValue() }
                </div>
            </div>
        );
    }
}