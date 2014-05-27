/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "exports"
],
function (exports) {

    /**
     * Returns the whole number beginning of the hour. For example, 11.5 would return 11.
     * @param {number} time
     * @returns {number}
     */
    exports.beginningOfHour = function(time) {
        return Math.floor(time);
    };

    /**
     * Returns a whole number percentage of the time within the hour. For example, 11.5 would
     * return 50.
     * @param {number} time
     * @returns {number}
     */
    exports.percentageOfHour = function(time) {
        var percentage = time - Math.floor(time);
        return Math.round(percentage * 100);
    };

    exports.roundToFifteenMinutes = function(time) {
        return Math.round(time * 4) / 4;
    };

    exports.roundToFiveMinutes = function(time) {
        return Math.round(time * 12) / 12;
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
});