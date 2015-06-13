/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
(function() {
    // main can is optional. It can be a single module id string or an array of module id strings.
    var main = require.rawConfig.main;
    if (!main) {
        main = [];
    } else if (typeof main === 'string') {
        main = [main];
    }

    require({
        packages: [
            { name: 'mytime', location: '../../script/mytime' },
            { name: 'lodash', location: '../lodash/dist', main: 'lodash.min' }
        ]
    }, ['mytime/debug-helper', 'dojo/parser', 'dojo/ready'].concat(main), function(_1, parser, ready) {
        ready(function() {
            parser.parse();
        });
    });
})();