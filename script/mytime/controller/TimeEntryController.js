/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "dojo/_base/declare", "dojo/_base/lang",
    "mytime/model/modelRegistry", "mytime/model/TimeEntry",
    "mytime/command/CreateTimeEntryCommand", "mytime/command/UpdateTimeEntryCommand",
    "mytime/command/DeleteTimeEntryCommand",
    "mytime/rest/PutEntryRequest", "mytime/rest/DeleteEntryRequest",
    "mytime/controller/_CrudController",
    "mytime/util/syncFrom"
], function(
    declare, lang,
    modelRegistry, TimeEntry,
    CreateTimeEntryCommand, UpdateTimeEntryCommand, DeleteTimeEntryCommand,
    PutEntryRequest, DeleteEntryRequest,
    _CrudController,
    syncFrom
) {

    return declare([_CrudController], {

        createCommand: CreateTimeEntryCommand,
        updateCommand: UpdateTimeEntryCommand,
        deleteCommand: DeleteTimeEntryCommand,

        commandObjectProperty: "timeEntry",
        commandIdProperty: "timeEntryId",

        objectTypeConstructor: TimeEntry,
        objectTypeName: "TimeEntry",
        objectTypeStringForMessages: "time entry",
        storageKey: "timeEntryStore",

        constructor: function(args) {
            lang.mixin(this, args);
            this.own( syncFrom(modelRegistry, "timeEntryStore", this, "store") );
        },

        _beforeCreate: function(command) {
            if (this._validate(command)) {
                this.inherited(arguments);
            }
        },

        _beforeUpdate: function(command) {
            if (this._validate(command)) {
                this.inherited(arguments);
            }
        },

        _validate: function(command) {
            var entry = command.timeEntry;
            if (entry.startHour > entry.endHour) {
                var swap = entry.startHour;
                entry.startHour = entry.endHour;
                entry.endHour = swap;
            }
            return true;
        },

        _afterCreate: function(command, entry) {
            //this.requestQueue.push(new PutEntryRequest(entry));
        },

        _afterUpdate: function(command, entry) {
            //this.requestQueue.push(new PutEntryRequest(entry));
        },

        _afterDelete: function(command, entry) {
            //this.requestQueue.push(new DeleteEntryRequest(entry));
        }
    });

});