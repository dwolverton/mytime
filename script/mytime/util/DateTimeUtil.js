/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "exports", "dojo/number", "dojo/date/locale"
],
function (exports, number, locale) {

    var MILLIS_PER_DAY = 24 * 60 * 60 * 1000;

    /**
     * Returns the whole number beginning of the hour. For example, 11.5 would return 11.
     * @param {number} time
     * @returns {number}
     */
    exports.beginningOfHour = function(time) {
        return Math.floor(time);
    };

    /**
     * Return the fraction portion of a time, as a decimal, un-rounded.
     * @param {number} time
     * @returns {number} 0 <= x < 1
     */
    exports.fractionOfHour = function(time) {
        return time - Math.floor(time);
    };

    /**
     * Returns a whole number percentage of the time within the hour. For example, 11.5 would
     * return 50.
     * @param {number} time
     * @returns {number}
     */
    exports.percentageOfHour = function(time) {
        return Math.round(exports.fractionOfHour(time) * 100);
    };

    exports.roundToFifteenMinutes = function(time) {
        return Math.round(time * 4) / 4;
    };

    exports.roundToFiveMinutes = function(time) {
        return Math.round(time * 12) / 12;
    };

    exports.getHourFromDate = function(date) {
        return date.getHours() + (date.getMinutes() / 60) + (date.getSeconds() / 60 / 60);
    };

    /**
     * Convert the given JavaScript Date object to a date string as used to store dates in this
     * application (that is "yyyy-mm-dd").
     * @param {Date} date
     * @returns {string}
     */
    exports.convertDateObjectToDateString = function(date) {
        var year = date.getFullYear(),
            month = (date.getMonth() + 1),
            day = date.getDate();

        if (month < 10) {
            month = "0" + month;
        }
        if (day < 10) {
            day = "0" + day;
        }
        return year + "-" + month + "-" + day;
    };

    exports.convertDateStringToDateObject = function(dateString) {
        if (!dateString) {
            return null;
        }
        var parts = dateString.split('-');
        var MIDDLE_OF_DAY = 12;
        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), MIDDLE_OF_DAY);
    };

    /**
     * Get the current date in the standard format for this application.
     * @returns {string}
     */
    exports.getCurrentDate = function() {
        return exports.convertDateObjectToDateString(new Date());
    };

    exports.numberToStringWithNth = function(number) {
        var lastDigit = number % 10;
        if (number > 10 && number < 20) {
            return number + 'th';
        } else if (lastDigit === 1) {
            return number + 'st';
        } else if (lastDigit === 2) {
            return number + 'nd';
        } else if (lastDigit === 3) {
            return number + 'rd';
        } else {
            return number + 'th';
        }
    };

    /**
     * @param month {number} January = 0
     * @returns {string}
     */
    exports.monthToThreeDigitString = function(month) {
        switch (month) {
            case 0: return 'Jan'
        }
    };

    exports.duration = function(hour1, hour2) {
        if (_.isObject(hour1)) {
            return exports.duration(hour1.startHour, hour1.endHour);
        }
        return Math.abs(hour2 - hour1);
    };

    /**
     * Given a number of hours, format it as a string with exactly two places after the decimal.
     */
    exports.formatWithTwoDecimals = function(duration) {
        return number.format(duration, { places: 2});
    };

    /**
     * Given a JavaScript date, format it in a friendly way (excludes time)
     * @param {Date} date
     */
    exports.formatFriendlyDate = function(date) {
        var now = new Date();
        now.setHours(0);
        now.setMinutes(0);
        now.setSeconds(0);
        now.setMilliseconds(0);
        var today = now.valueOf();

        if (date.valueOf() >= today && date.valueOf() - today < MILLIS_PER_DAY) {
            return 'Today';
        } else if (date.valueOf() < today && today - date.valueOf() <= MILLIS_PER_DAY) {
            return 'Yesterday';
        } else if (now.getYear() === date.getYear()) {
            return locale.format(date, {selector: 'date', datePattern: 'MMM d'});
        } else {
            return locale.format(date, {selector: 'date', datePattern: 'MMM d, yyyy'});
        }
    }
});