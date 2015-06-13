/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
        "module", "dojo/_base/declare",
        "mytime/model/_ModelBase"
], function (module, declare, _ModelBase) {
    return declare(module.id, [_ModelBase], {
        _propertyNames: ["id", "date", "startHour", "endHour", "text", "taskId"],

        id: null,
        date: null,
        startHour: null,
        endHour: null,

        text: null,
        taskId: null
    });
});