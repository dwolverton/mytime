/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "dojo/_base/declare",
    "mytime/model/modelRegistry", "mytime/model/Task",
    "mytime/command/CreateTaskCommand", "mytime/command/UpdateTaskCommand",
    "mytime/command/DeleteTaskCommand",
    "mytime/controller/_CrudController",
    "mytime/util/syncFrom", "mytime/util/ColorGenerator"
], function(
    declare,
    modelRegistry, Task,
    CreateTaskCommand, UpdateTaskCommand, DeleteTaskCommand,
    _CrudController,
    syncFrom, ColorGenerator
) {

    return declare([_CrudController], {

        createCommand: CreateTaskCommand,
        updateCommand: UpdateTaskCommand,
        deleteCommand: DeleteTaskCommand,

        commandObjectProperty: "task",
        commandIdProperty: "taskId",

        objectTypeConstructor: Task,
        objectTypeName: "Task",
        objectTypeStringForMessages: "task",
        storageKey: "taskStore",

        colorGenerator: null,

        constructor: function() {
            this.colorGenerator = new ColorGenerator();
            this.own( syncFrom(modelRegistry, "taskStore", this, "store") );
        },

        _beforeCreate: function(command, task) {
            if (!task.get("color")) {
                task.set("color", this.colorGenerator.next());
            }
        }
    });

});