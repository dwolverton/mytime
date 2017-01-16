/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "module", "dojo/_base/declare",
    "mytime/model/_ModelBase"
], function (
    module, declare, _ModelBase
) {
    var Task = declare(module.id, [_ModelBase], {
        _propertyNames: ["id", "description", "color", "integrations"],

        id: null,
        description: null,
        color: null,
        integrations: null
    });

    return Task;
});