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
        _propertyNames: ["id", "code", "name", "color"],

        id: null,
        code: null,
        name: null,
        color: null
    });

    /**
     * "static" method to build a string for the task, including code and name if available.
     * @param task
     * @returns {string}
     */
    Task.getDisplayText = function(task) {
        var text = task.code || "";
        if (task.name) {
            text += " " + task.name;
        }
        return text;
    };

    return Task;
});