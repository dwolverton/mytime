/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "lodash",
    "dojo/_base/declare", "dojo/_base/lang"
],
function (_, declare, lang) {

    /**
     * Emulates dojo/Stateful's setters for classes that for some reason cannot inherit Stateful.
     */
    return declare([], {

        set: function(prop, value) {
            var setter = this["_" + prop + "Setter"];
            if (typeof setter === "function") {
                return setter.call(this, value);
            } else {
                this[prop] = value;
            }
        },

        /**
         * On object construction call the setters on all properties set via the constructor params.
         * @param params
         */
        postscript: function(params) {
            _.forOwn(params, lang.hitch(this, function(value, key) {
                this.set(key, value);
            }));
        }

    });
});