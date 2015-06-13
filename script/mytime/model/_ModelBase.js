/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "module", "lodash", "dojo/_base/declare",
    "dojo/Stateful",
    "mytime/util/setIfDifferent"
],
function (module, _, declare, Stateful, setIfDifferent) {
    return declare(module.id, [Stateful], {
        /**
         * List of valid properties for the given model type.
         */
        _propertyNames: [],

        constructor: function(values) {
            if (typeof values === 'object') {
                this.updateFrom(values);
            }
        },

        postscript: function(){
            // override Stateful implementation that copies over all properties from constructor arg.
        },

        /**
         * Sets properties on this instance, only setting valid properties. Note: values will always be set to null
         * rather than undefined.
         *
         * @param {object} properties set of properties and values to set. Only the valid properties will be copied.
         * @param {Boolean} clearUnspecifiedProperties if true, properties that are not present on the properties
         *                  parameter will be unset on this instance; if false, those properties will be left with their
         *                  previous value.
         */
        updateFrom: function(properties, clearUnspecifiedProperties) {
            _.forEach(this._propertyNames, function(property) {
                if (clearUnspecifiedProperties || properties.hasOwnProperty(property)) {
                    var value = properties[property];
                    if (_.isUndefined(value)) {
                        value = null;
                    }
                    setIfDifferent(this, property, value);
                }
            }, this);
        }
    });
});