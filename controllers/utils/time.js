const moment = require('moment');

module.exports = {

    getAgeFromTime  : function(time){
        var date = moment(parseInt(time));
        var now = moment();

        var duration = moment.duration(now.diff(date));
        var age = Math.floor(duration.asYears());

        return age;
    }


}