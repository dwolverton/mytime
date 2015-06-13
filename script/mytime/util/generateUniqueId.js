/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([], function () {
    var rand = new Date().getTime();
    var counter = 0;
    return function() {
        return (counter++) + "X" + rand;
    }
});