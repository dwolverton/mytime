/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "dojo/_base/lang", "dojo/_base/declare", "dojo/when",
    "mytime/model/modelRegistry", "mytime/model/Task",
    "mytime/command/CreateTaskCommand", "mytime/command/UpdateTaskCommand",
    "mytime/command/DeleteTaskCommand",
    "mytime/rest/PutTaskRequest", "mytime/rest/DeleteTaskRequest",
    "mytime/controller/_CrudController",
    "mytime/util/syncFrom", "mytime/util/ColorGenerator"
], function(
    lang, declare, when,
    modelRegistry, Task,
    CreateTaskCommand, UpdateTaskCommand, DeleteTaskCommand,
    PutTaskRequest, DeleteTaskRequest,
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

        timeEntryStore: null,
        requestQueue: null,

        constructor: function(args) {
            lang.mixin(this, args);
            this.colorGenerator = new ColorGenerator();
            this.own( syncFrom(modelRegistry, "taskStore", this, "store") );
            this.own( syncFrom(modelRegistry, "timeEntryStore", this) );
        },

        _beforeCreate: function(command, task) {
            if (!task.get("color")) {
                task.set("color", this.colorGenerator.next());
            }
        },

        _beforeUpdate: function(command, previousTask) {
            command.then(lang.hitch(this, function(result) {
                this._triggerUpdatesForTimeEntriesWithTaskId(result.taskId);
            }));
        },

        _triggerUpdatesForTimeEntriesWithTaskId: function(taskId) {
            when(this.timeEntryStore.query({taskId: taskId}), lang.hitch(this, function(timeEntries) {
                _.forEach(timeEntries, function(timeEntry) {
                    // re-put the same entry to trigger a update notification
                    this.timeEntryStore.put(timeEntry);
                }, this);
            }));
        },

        _afterCreate: function(command, task) {
            //this.requestQueue.push(new PutTaskRequest(task));
        },

        _afterUpdate: function(command, task) {
            //this.requestQueue.push(new PutTaskRequest(task));
        },

        _afterDelete: function(command, task) {
            //this.requestQueue.push(new DeleteTaskRequest(task));
        }
    });

});