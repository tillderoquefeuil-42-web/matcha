import Moment from 'moment';

window.moment = Moment;

Date.__proto__.toDatetime = function(){
    var d = [
        this.getFullYear(),
        this.getMonth(),
        this.getDate(),
        this.getHours(),
        this.getMinutes(),
        this.getSeconds()
    ];

    var datetime = '';
    for (var i  in d){
        datetime += (d[i] < 10? '0':'') + d[i];
    }

    return datetime;
}

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

    getAgeFromDatetime  : function(datetime){
        var date;

        if (typeof datetime === 'number'){
            date = this.Moment(parseInt(datetime));
        } else {
            date = this.Moment(datetime);
        }

        var now = this.Moment();

        var duration = this.Moment.duration(now.diff(date));
        var age = Math.floor(duration.asYears());

        return age;
    },

    getAgeFromTime  : function(time){
        var date = this.Moment(parseInt(time));
        var now = this.Moment();

        var duration = this.Moment.duration(now.diff(date));
        var age = Math.floor(duration.asYears());

        return age;
    },

    getDateFromAge  : function(age){
        var d = this.Moment().subtract(age, 'years');
        return d.toDate();
    },

    getTimeFromAge  : function(age){
        var date = this.getDateFromAge(age);
        var timestamp = parseInt(date.getTime());

        return timestamp;
    },

    ageToDatetime   : function(age) {
        let date = this.getDateFromAge(age);
        return this.toDatetime(date);
    },

    toDatetime      : function(date){
        if (!date){
            return '';
        }

        if (date instanceof this.Moment){
            date = date.toDate();
        }

        var d = [
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate()
        ];

        var datetime = '';
        for (var i  in d){
            datetime += (d[i] < 10? '0':'') + d[i];
        }

        return datetime;
    },

    datetimeToDate  : function(datetime){
        var date;

        if (typeof datetime === 'number'){
            date = this.Moment(parseInt(datetime));
        } else {
            date = this.Moment(datetime);
        }

        return date.toDate();
    }
}
