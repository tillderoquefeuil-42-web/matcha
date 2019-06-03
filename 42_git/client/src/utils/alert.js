import Alert from 'react-s-alert';

export default {

    show    : function(parameters){
        const types = ['success', 'warning', 'info', 'error'];

        parameters = parameters || {};

        if (types.indexOf(parameters.type) === -1){
            parameters.type = types[2];    
        }

        let alert = this.create(parameters);

        return Alert[parameters.type](alert.message, alert.params);
    },

    close   : function(id){
        Alert.close(id);
    },
    
    closeAll: function(){
        Alert.closeAll();
    },

    create  : function(parameters){

        let t = (parameters.title? `<h1>${parameters.title}</h1>` : ''); 
        let m = (parameters.message? `<span>${parameters.message}</span>` : ''); 

        let alert = {
            message : t + m,
            params  : {
                position: 'top-right',
                effect  : 'slide',
                timeout : parameters.timeout || 5000,
                offset  : 20
                // onShow: function () {console.log('aye!')},
            }
        }

        return alert;
    }

}