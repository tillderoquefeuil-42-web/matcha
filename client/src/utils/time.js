import Moment from 'moment';

window.moment = Moment;

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
    },

    getAgeFromTime  : function(time){
        var date = this.Moment(parseInt(time));
        var now = this.Moment();

        var duration = this.Moment.duration(now.diff(date));
        var age = Math.floor(duration.asYears());

        return age;
    },

    getTimeFromAge  : function(age){
        var date = this.Moment().subtract(age, 'years');
        var timestamp = parseInt(date.format('x'));

        return timestamp;
    }
}
