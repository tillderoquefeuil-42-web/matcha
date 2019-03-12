import React from 'react';

import utils from '../../utils/utils';
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
            on_drop : false,
            maxFiles: props.maxFiles || maxFiles
        }
    }

    onDragOver = event => {
        event.preventDefault();
        event.stopPropagation();

        if (!this.state.on_drop){
            this.setState({on_drop : true});
        }
    }

    onDragLeave = event => {
        if (this.state.on_drop){
            this.setState({on_drop : false});
        }
    }

    handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();

        let files = event.dataTransfer.files;

        let total = this.props.files.length + files.length;

        if (total > this.state.maxFiles && this.props.replace){
            total = 0;
        }

        if (total > this.state.maxFiles){
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
                id={ this.props.id }
                className={ this.getDroppableClasses() }
                onDragOver={ this.onDragOver }
                onDragLeave={ this.onDragLeave }
                onDrop={ this.handleDrop }
            >
                { this.props.children }
            </div>
        );
    }

}

export class FileInput extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            maxFiles: props.maxFiles || maxFiles
        }
    }

    handleChange = event => {

        let files = event.target.files;

        let total = this.props.files.length + files.length;
        if (total > this.state.maxFiles){
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

        if (file._id){
            return <img src={ utils.getFileUrl(file) } alt="" />
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
            type        : type,
            showPicture : false,
            url         : utils.getFileUrl(props.file)
        };

    }

    componentDidMount() {

        let e = new Event('pictures-display');

        e.data = {
            multi       : this.props.multi,
            url         : this.state.url
        };

        document.dispatchEvent(e);
    }

    getFile() {

        let type = this.state.type;

        if (type === 'view-img'){
            return <img src={ this.state.url } alt="" />
        } else if (type === 'view-file'){
            return <i className="far fa-file-pdf"></i>;
        } else if (type === 'view-txt'){
            return <i className="far fa-file-alt"></i>;
        }

        return null;
    }

    buildSelectableFile(file) {
        let type = this.state.type;

        if (type !== 'view-img'){
            return (
                <a href={ this.state.url } rel="noopener noreferrer" target="_blank">
                    { this.getFile() }
                </a>
            );
        }


        return (
            <a href="# " src={ this.state.url } onClick={ this.showPicture }>
                { this.getFile() }
            </a>
        );

    }

    showPicture = event => {

        let e = new Event('pictures-display');

        e.data = {
            showPicture : true,
            multi       : this.props.multi,
            url         : this.state.url
        };

        document.dispatchEvent(e);
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
                { this.buildSelectableFile(this.props.file) }
            </div>
        );
    }

}


export class PicturesDisplay extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            show    : false,
            urls    : [],
            index   : 0
        };
    }

    componentDidMount() {
        let _this = this;
        document.addEventListener("pictures-display", function(e){
            _this.handleEvent(e.data);
        });
    }

    componentDidUpdate() {
        if (this.state.show){
            document.addEventListener("keyup", this.handleKeyPress, true);
        } else {
            document.removeEventListener("keyup", this.handleKeyPress);
        }
    }

    handleKeyPress = e => {
        let arrows = ['ArrowRight', 'ArrowLeft', 'Escape'];

        if (!this.state.show || arrows.indexOf(e.key) === -1){
            return;
        }

        e.stopPropagation();

        switch (e.key){
            default:
                break;
            case 'Escape':
                this.handleClosing(e);
                break;
            case 'ArrowRight':
                e.target.id = 'next-picture';
                break;
            case 'ArrowLeft':
                e.target.id = 'last-picture'
                break;
        }

        this.changePicture(e);
    }

    handleEvent(data){

        let urls = this.state.urls;
        let index = 0;

        if (data.resetUrls){
            urls = [];
        }

        let show = data.showPicture;

        if (data.multi && data.url){
            index = urls.indexOf(data.url);

            if (index === -1){
                index = urls.length;
                urls.push(data.url);
            }
        } else if (data.url){
            urls = [data.url];
        }

        this.setState({
            show    : show,
            urls    : urls,
            index   : index
        });
    }

    handleClosing = event => {
        this.setState({show:false});
    }

    changePicture = event => {
        let urls = this.state.urls;
        let index = this.state.index;

        if (event.target.id === 'last-picture'){
            index = (index - 1 >= 0)? index - 1 : urls.length - 1;
        } else if (event.target.id === 'next-picture'){
            index = (index + 1 <= urls.length - 1)? index + 1 : 0;
        }

        this.setState({index : index});
    }

    buildPictureView() {
        let urls = this.state.urls;
        let index = this.state.index;

        let data = [];
        if (urls.length && urls[index]){

            if (urls.length > 1){
                data.push(
                    <i
                        key="last"
                        id="last-picture"
                        className="fas fa-caret-left"
                        onClick={ this.changePicture }
                    ></i>
                );
            }

            data.push(
                <img
                    src={ urls[index] }
                    alt=""
                    key="picture"
                />
            );

            if (urls.length > 1){
                data.push(
                    <i
                        key="next"
                        id="next-picture"
                        className="fas fa-caret-right"
                        onClick={ this.changePicture }
                    ></i>
                );
            }
        }

        return data;
    }

    render() {
        if (!this.state.show){
            return null;
        }

        return (
            <div className="pictures-display">

                <span className="close-picture-display" onClick={ () => this.handleClosing() }>
                    <i className="fa fa-times"></i>
                </span>

                { this.buildPictureView() }

            </div>
        );
    }
}