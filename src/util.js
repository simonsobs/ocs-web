// -*- mode: web; web-mode-code-indent-offset: 4; -*-

import $ from 'jquery';

//(function() {
    
export
function get_date_time_string(timestamp, joiner) {
        function twodig(x) {
            if (x<10) return '0'+x;
            return x;
        }

        if (!timestamp)
            timestamp = Date.now() / 1000.0;

        var d = new Date(parseInt(timestamp)*1000);
        if (isNaN(d.getTime())) {
            return ['??', '??'];
        }
        var datestr = d.getUTCFullYear() + '-' + twodig(d.getUTCMonth()+1) + '-'
                    + twodig(d.getUTCDate());
        var timestr = twodig(d.getUTCHours()) + ':' + twodig(d.getUTCMinutes()) + ':' +
                      twodig(d.getUTCSeconds());

        if (!joiner)
            return [datestr, timestr];

        return datestr + joiner + timestr;
    }

    var HUMANITIES = [
        {max:    60*2, unit:     1, label: 'secs'},
        {max:  3600*2, unit:    60, label: 'mins'},
        {max: 86400*2, unit:  3600, label: 'hours'},
        {max:    null, unit: 86400, label: 'days'},
    ];

export
function human_timespan(delta, precision) {
        /* Convert delta, a time in seconds, to a textual representation
         * in comprehensible units with ~2+precision sigfigs.  E.g. 86401
         * becomes '1.00 days'. */
        var spec;
        var i;
        if (!precision)
            precision = 1;
        for (i=0; i<HUMANITIES.length; i++) {
            spec = HUMANITIES[i];
            if (!spec.max || Math.abs(delta) < spec.max)
                break;
        }
        return (delta / spec.unit).toFixed(precision) + ' ' + spec.label;
    }

export
function timestamp_now() {
        var now = new Date();
        return now.getTime() / 1000.0;
    }

export
function log(msg) {
        var log = $("#messages");
        log.html(log.html() + msg + '<br>');
    //        log.scrollTop(log[0].scrollHeight - log.height());
    console.log('util', msg);
    }

//    module.exports = {
//        human_timespan: human_timespan,
//        timestamp_now: timestamp_now,
//        get_date_time_string: get_date_time_string,
//        log: log,
//    };
//
//}());
//
