/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
(function() {
    var originalError = console.error;

    console.error = function() {
        for (var i = 0; i < arguments.length; i++) {
            if (arguments[i].stack) {
                originalError.call(console, "#" + (i + 1) + " -> " + arguments[i].stack);
            }
        }

        originalError.apply(console, arguments);
    }
})();