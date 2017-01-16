/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define(['dojox/mvc/sync'], function (sync) {
    /**
     * @param {dojo/Stateful} source object to sync from
     * @param {string} property name of property on source object
     * @param {object} target object to sync to
     * @param {string} [targetProperty] name of property on target object (optional - if omitted, use property param.)
     */
    return function(source, property, target, targetProperty) {
        return sync(source, property, target, targetProperty || property, {
            bindDirection: sync.from
        });
    }
});