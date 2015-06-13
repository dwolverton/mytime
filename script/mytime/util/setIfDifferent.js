/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([], function () {
    return function(stateful, property, value) {
        if (stateful.get(property) !== value) {
            stateful.set(property, value);
        }
    }
});