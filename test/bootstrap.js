/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
require({
    packages: [
        { name: 'mytime', location: '../../script/mytime' },
        { name: 'lodash', location: '../lodash/dist', main: 'lodash.min' },

        { name: 'test', location: '../../test' },
        { name: 'mocha', location: '../mocha', main: 'mocha' },
        { name: 'chai', location: '../chai', main: 'chai' },
        { name: 'sinon', location: '../sinonjs', main: 'sinon' },
        { name: 'sinon-chai', location: '../sinon-chai/lib', main: 'sinon-chai' }
    ]
}, ['require', 'mytime/debug-helper', 'chai', 'sinon-chai', 'sinon', 'mocha'], function(require, _1, chai, sinonChai, sinon){
    mocha.ui('bdd');
    mocha.reporter('html');
    mocha.timeout(3000);

    chai.use(sinonChai);
    window.expect = chai.expect;

    require([
        'test/tests'
    ], function () {
        mocha.run();
    });
});