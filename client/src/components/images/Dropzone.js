import React from 'react';

import alert from '../../utils/alert';
import trans from '../../translations/translate';

import './images.css';

const maxFiles = 9;
const maxSize = 25000000;

function manageOneFile(file, addOneFile){
    let title = trans.get('ERROR.TITLE');
    let msg;

    if (!(file instanceof File)){
        msg = trans.get('ERROR.NOT_A_FILE');
        alert.show({title: title, message: msg, type: 'error'});
        return;
    }

    if (file.size > maxSize){
        msg = trans.get('ERROR.FILE_TOO_BIG');
        alert.show({title: title, message: msg, type: 'error'});
        return;
    }

    file.id = (new Date()).getTime();
    file = parseOneFile(file, addOneFile);

    if (file){
        addOneFile(file);
    } else if (file === false){
        msg = trans.get('ERROR.TYPE_NOT_SUPPORTED');
        alert.show({title: title, message: msg, type: 'error'});
        console.warn('bad file');
    }
}

function parseOneFile(file, addOneFile){

    if (file && file.type.match('image.*')) {
        let reader = new FileReader();

        reader.onloadend = () => {
            file.preview_url = reader.result;
            addOneFile(file);
        }

        reader.readAsDataURL(file);
        return;
    } else if (file && file.type.match('application/pdf')) {
        file.preview_icon = "far fa-file-pdf";
    } else if (file && file.type.match('text.*')) {
        file.preview_icon = "far fa-file-alt";
    } else {
        console.log(file.type);
        return false;
    }

    return file;
}



export class Dropzone extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            on_drop : false
        }
    }

    onDragOver = event => {
        event.preventDefault();
        event.stopPropagation();

        if (!this.state.on_drop){
            this.setState({on_drop : true});
        }
    }

    handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();

        let files = event.dataTransfer.files;

        let total = this.props.files.length + files.length;
        if (total > maxFiles){
            let title = trans.get('ERROR.TITLE');
            let msg = trans.get('ERROR.TOO_MANY_FILES');
            alert.show({title: title, message: msg, type: 'error'});
        } else if (event.dataTransfer.files.length > 0){

            for (let i in files){
                if (typeof files[i] === 'object'){
                    manageOneFile(files[i], this.props.addFile);
                }
            }
        }

        this.setState({on_drop : false});
    }

    getDroppableClasses(){
        let classes = "dropzone files-dump droppable ";

        if (this.state.on_drop){
            classes += 'on-drop ';
        }

        if (this.props.className){
            classes += this.props.className;
        }

        return classes;
    }

    render() {
        return (
            <div
                className={ this.getDroppableClasses() }
                onDragOver={ this.onDragOver }
                onDrop={ this.handleDrop }
            >
                { this.props.children }
            </div>
        );
    }

}

export class FileInput extends React.Component {

    handleChange = event => {

        let files = event.target.files;

        let total = this.props.files.length + files.length;
        if (total > maxFiles){
            let title = trans.get('ERROR.TITLE');
            let msg = trans.get('ERROR.TOO_MANY_FILES');
            alert.show({title: title, message: msg, type: 'error'});
        } else if (files.length > 0){

            for (let i in files){
                if (typeof files[i] === 'object'){
                    manageOneFile(files[i], this.props.addFile);
                }
            }
        }

    }

    triggerClick() {
        this.input.click();
    }

    getClasses(){
        let classes = "file-input ";

        if (this.props.className){
            classes += this.props.className;
        }

        return classes;
    }

    render(){
        return (
            <input
                className={ this.getClasses() }
                type="file"
                onChange={ this.handleChange }
                ref={ (el) => { this.input = el; }}
                multiple={ this.props.multiple? true : false }
            />
        );
    }

}

export class FileContainer extends React.Component {

    constructor(props) {
        super(props);

        this.state = {};
    }

    buildFilePreview(file){

        if (file.preview_url){
            return <img src={ file.preview_url } alt="" />
        }

        if (file.preview_icon){
            return <i className={ file.preview_icon } ></i>
        }

        return null;
    }

    handleDelete(fileId){
        this.props.removeFile(fileId);
    }

    getFiles() {
        let previews = [];

        for (let i in this.props.files){
            let file = this.props.files[i];

            previews.push(
                <div className="file-preview-container" key={ file.id }>
                    <span className="delete-file" onClick={ () => this.handleDelete(file.id) }>
                        <i className="far fa-times-circle"></i>
                    </span>
                    <div className="file-preview">
                        { this.buildFilePreview(file) }
                    </div>
                </div>
            );
        }

        return previews;
    }

    render() {
        return (
            <div className="files-container">
                { this.getFiles() }
            </div>
        );
    }
}

export class OneFileView extends React.Component {

    constructor(props) {
        super(props);

        let file = this.props.file;

        let type;
        if (file && file.type.match('image.*')) {
            type = 'view-img';
        } else if (file && file.type.match('application/pdf')) {
            type = 'view-file';
        } else if (file && file.type.match('text.*')) {
            type = 'view-txt';
        }

        this.state = {
            type    : type
        };

    }

    getFileUrl() {

        let file = this.props.file;
        let token = (localStorage.getItem('token')? localStorage.getItem('token') : "");

        let url = `http://localhost:8000/file/private?_t=${token}&filename=${file.filename}`;

        return url;
    }

    getFile() {

        let type = this.state.type;

        if (!type) {
        } else if (type === 'view-img'){
            return <img src={ this.getFileUrl() } alt="" />
        } else if (type === 'view-file'){
            return <i className="far fa-file-pdf"></i>;
        } else if (type === 'view-txt'){
            return <i className="far fa-file-alt"></i>;
        }

        return null;
    }

    getClasses() {
        let classes = "one-file-view ";

        if (this.state.type){
            classes += this.state.type;
        }

        return classes;
    }

    render() {

        return (
            <div className={ this.getClasses() } >
                <a href={ this.getFileUrl() } rel="noopener noreferrer" target="_blank">
                    { this.getFile() }
                </a>
            </div>
        );
    }

}