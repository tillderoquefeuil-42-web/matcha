const moment = require('moment');

module.exports = {

    getAgeFromTime      : function(time){
        var date = moment(parseInt(time));
        var now = moment();

        var duration = moment.duration(now.diff(date));
        var age = Math.floor(duration.asYears());

        return age;
    },

    getAgeFromDatetime  : function(datetime){
        var date;

        if (typeof datetime === 'number'){
            date = moment(parseInt(datetime));
        } else {
            date = moment(datetime);
        }

        var now = moment();

        var duration = moment.duration(now.diff(date));
        var age = Math.floor(duration.asYears());

        return age;
    },

    toDatetime          : function(date){
        if (!date){
            return '';
        }

        if (date instanceof moment){
            date = date.toDate();
        }

        var d = [
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        ];

        var datetime = '';
        for (var i  in d){
            datetime += (d[i] < 10? '0':'') + d[i];
        }

        return datetime;
    },

    toTimestamp         : function(datetime){
        var date;

        if (typeof datetime === 'number'){
            date = moment(parseInt(datetime));
        } else {
            date = moment(datetime);
        }

        return date.format('x');
    }



}