/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define(["exports"], function (exports) {
    var DEFAULT = '0,0';

    /**
     * Get CSS color string from mytime color string and luminosity
     * @param {?string} color mytime color format. If falsy, the default color (gray) will be used.
     * @param {number} luminosity number from 0 to 100 representing a percentage HSL luminosity
     */
    exports.withLuminosity = function(color, luminosity) {
        color = color || DEFAULT;
        return 'hsl(' + color + '%, ' + luminosity + '%)';
    };

    exports.lighter = function(color) {
        return exports.withLuminosity(color, 80);
    };

    exports.light = function(color) {
        return exports.withLuminosity(color, 65);
    };

    exports.base = function(color) {
        return exports.withLuminosity(color, 50);
    };

    exports.dark = exports.shadow = function(color) {
        return exports.withLuminosity(color, 35);
    };

    exports.darker = function(color) {
        return exports.withLuminosity(color, 20);
    };
});