define([
    "dojo/_base/lang", "dojo/_base/declare",
    "dojox/mvc/sync",
    'mytime/model/modelRegistry', 'mytime/model/TimeEntry',
    "mytime/command/CreateTimeEntryCommand", 'mytime/command/UpdateTimeEntryCommand',
    'mytime/command/DeleteTimeEntryCommand',
    'mytime/persistence/IdGenerator'
], function(
    lang, declare,
    sync,
    modelRegistry, TimeEntry,
    CreateTimeEntryCommand, UpdateTimeEntryCommand, DeleteTimeEntryCommand,
    IdGenerator
) {

    return declare(null, {

        _timeEntryStore: null,

        constructor: function() {
            sync(modelRegistry, 'timeEntryStore', this, '_timeEntryStore', {bindDirection: sync.from});
            CreateTimeEntryCommand.subscribe(lang.hitch(this, 'handleCreateTimeEntry'));
            UpdateTimeEntryCommand.subscribe(lang.hitch(this, 'handleUpdateTimeEntry'));
            DeleteTimeEntryCommand.subscribe(lang.hitch(this, 'handleDeleteTimeEntry'));
        },

        handleCreateTimeEntry: function(command) {
            if (!this._timeEntryStore) {
                command.reject(new Error("Cannot add time entry before system is initialized."));
            } else {
                var timeEntry = new TimeEntry(command.timeEntry);
                timeEntry.set('id', IdGenerator.nextIdForType('TimeEntry'));
                console.log('PUT NEW ' + JSON.stringify(timeEntry));
                this._timeEntryStore.put(timeEntry);
                command.resolve({timeEntryId: timeEntry.get('id'), timeEntry: timeEntry});
            }
        },

        handleUpdateTimeEntry: function(command) {
            if (!this._timeEntryStore) {
                command.reject(new Error("Cannot update time entry before system is initialized."));
            } else {
                var existingEntry = this._timeEntryStore.get(command.timeEntry.get('id'));
                if (!existingEntry) {
                    var error = new Error("Cannot update time entry. It does not exist.");
                    error.timeEntry = command.timeEntry;
                    error.timeEntryId = command.timeEntry.get('id');
                    command.reject(error);
                    return;
                }
                existingEntry.updateFrom(command.timeEntry, true);
                console.log('PUT ' + JSON.stringify(existingEntry));
                this._timeEntryStore.put(existingEntry);
                command.resolve({timeEntryId: existingEntry.get('id'), timeEntry: existingEntry});
            }
        },

        handleDeleteTimeEntry: function(command) {
            if (!this._timeEntryStore) {
                command.reject(new Error("Cannot delete time entry before system is initialized."));
            } else {
                var existingEntry = this._timeEntryStore.get(command.timeEntryId);
                if (!existingEntry) {
                    var error = new Error("Cannot delete time entry. It does not exist.");
                    error.timeEntryId = command.timeEntryId;
                    command.reject(error);
                    return;
                }
                console.log('REMOVE ' + JSON.stringify(existingEntry));
                this._timeEntryStore.remove(command.timeEntryId);
                command.resolve({timeEntryId: command.timeEntryId, timeEntry: existingEntry});
            }
        }

        // TODO destroy
    });

});