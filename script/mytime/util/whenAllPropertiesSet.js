/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "lodash"
], function(
    _
) {
    /**
     * Call the callback as soon as all the properties on the object are truthy for the first time. The callback will be
     * called at most once.
     *
     * @param {dojo/Stateful} object stateful object on which the properties are found
     * @param {Array.<string>} properties names of one or more properties
     * @param {function} callback No parameters are passed to the callback.
     */
    return function(object, properties, callback) {
        // remove properties that are already set
        properties = _.filter(properties, function(property) {
            return !object.get(property);
        });

        if (properties.length === 0) {
            callback();
            return;
        }

        var handle = object.watch(function(property, oldValue, value) {
            if (value) {
                var i = _.indexOf(properties, property);
                if (i !== -1) {
                    properties.splice(i, 1);
                    if (properties.length === 0) {
                        handle.remove();
                        callback();
                    }
                }
            }
        });

        return handle;
    };
});