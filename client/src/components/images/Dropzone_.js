import React from 'react';
import Dropzone from 'react-dropzone';

import API from '../../utils/API';
import trans from '../../translations/translate';

export class DropZone extends React.Component{

    onDrop(files){
        var file = new FormData();
        file.append('name', files[0]);

        API.uploadPicture(file)
        .then(function(data){
            console.log(data);
        }, function(error){
            console.log(error);
        });
    }

    render(){
        return(
            <div>
                <Dropzone onDrop={ this.onDrop } >
                    <div>{ trans.get('DROPZONE.PLACEHOLDER') }</div>
                </Dropzone>
            </div>
        );
    }
}