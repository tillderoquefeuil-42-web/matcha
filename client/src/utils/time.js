import Moment from 'moment';


export default {

    Moment  : Moment,

    isSameDay   : function(date){
        let now = this.Moment();

        let f = 'YYYYMMDD';
    
        if (now.format(f) === date.format(f)){
            return true;
        }
    
        return false;
    },
    
    isRecent    : function(date){
        let recent = this.Moment().startOf('day').subtract(6, 'days');
    
        if (date >= recent){
            return true;
        }
    
        return false;
    }
}
