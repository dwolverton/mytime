/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define(["dojo/_base/declare", "mytime/persistence/LocalStorage"], function (declare, LocalStorage) {

    var lastColor = LocalStorage.retrieveObject("lastColor");
    if (!_.isNumber(lastColor)) {
        lastColor = -1;
    }

    return declare(null, {
        colors: [
            '0,100',
            '30,100',
            '60,100',
            '90,100',
            '120,100',
            '150,100',
            '180,100',
            '210,100',
            '240,100',
            '270,100',
            '300,100',
            '330,100'
        ],

        _index: lastColor,

        next: function() {
            this._index = (this._index + 1) % this.colors.length;
            LocalStorage.persistObject("lastColor", this._index);
            return this.colors[this._index];
        }
    });
});