import Moment from 'moment';
import trans from "../translations/translate";

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

Moment.locale('fr', {
    months : 'janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre'.split('_'),
    monthsShort : 'janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.'.split('_'),
    monthsParseExact : true,
    weekdays : 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split('_'),
    weekdaysShort : 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
    weekdaysMin : 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
    weekdaysParseExact : true,
    longDateFormat : {
        LT : 'HH:mm',
        LTS : 'HH:mm:ss',
        L : 'DD/MM/YYYY',
        LL : 'D MMMM YYYY',
        LLL : 'D MMMM YYYY HH:mm',
        LLLL : 'dddd D MMMM YYYY HH:mm'
    },
    calendar : {
        sameDay : '[Aujourd’hui à] LT',
        nextDay : '[Demain à] LT',
        nextWeek : 'dddd [à] LT',
        lastDay : '[Hier à] LT',
        lastWeek : 'dddd [dernier à] LT',
        sameElse : 'L'
    },
    relativeTime : {
        future : 'dans %s',
        past : 'il y a %s',
        s : 'quelques secondes',
        m : 'une minute',
        mm : '%d minutes',
        h : 'une heure',
        hh : '%d heures',
        d : 'un jour',
        dd : '%d jours',
        M : 'un mois',
        MM : '%d mois',
        y : 'un an',
        yy : '%d ans'
    },
    dayOfMonthOrdinalParse : /\d{1,2}(er|e)/,
    ordinal : function (number) {
        return number + (number === 1 ? 'er' : 'e');
    },
    meridiemParse : /PD|MD/,
    isPM : function (input) {
        return input.charAt(0) === 'M';
    },
    meridiem : function (hours, minutes, isLower) {
        return hours < 12 ? 'PD' : 'MD';
    },
    week : {
        dow : 1,
        doy : 4
    }
});

Moment.locale(trans.getLocale());

window.moment = Moment;

export default {

    Moment  : Moment,

    formats : {
        big     : 'MM DD YYYY HH:mm',
        short   : 'MM DD YYYY'
    },

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

    datetimeToMoment  : function(datetime){
        var date;

        if (typeof datetime === 'number'){
            date = this.Moment(parseInt(datetime));
        } else {
            date = this.Moment(datetime);
        }

        return date;
    },

    datetimeToDate  : function(datetime){
        var date = this.datetimeToMoment(datetime);

        if (date){
            return date.toDate();
        }

        return null;
    },

    getDurationFrom : function(datetime){
        let x = this.Moment();
        let y = this.Moment(datetime);

        return this.Moment.duration(y.diff(x));
    }
}
