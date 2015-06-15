/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "lodash", "dojo/_base/lang", "dojo/_base/declare", "dojo/when", "dojo/Stateful", "dojo/Evented",
    "dijit/_WidgetBase",
    "mytime/widget/TimeEntryDetails/TimeEntryDetailsView",
    "mytime/store/DummyJiraPicklistStore",
    "mytime/command/UpdateTimeEntryCommand",
    "mytime/command/CreateTaskCommand", "mytime/command/UpdateTaskCommand",
    "mytime/util/whenAllPropertiesSet", "mytime/util/syncFrom", "mytime/util/store/getAndObserve",
    "mytime/util/Integrations"
],
function (
    _, lang, declare, when, Stateful, Evented,
    _WidgetBase,
    TimeEntryDetailsView,
    JiraPicklistStore,
    UpdateTimeEntryCommand, CreateTaskCommand, UpdateTaskCommand,
    whenAllPropertiesSet, syncFrom, getAndObserve,
    Integrations) {

    /**
     * details entry/task details pane
     */
    return declare([_WidgetBase, Evented], {

        timeEntryStore: null,
        taskStore: null,
        jiraStore: new JiraPicklistStore(),

        selectedId: null,

        currentTimeEntry: null,
        currentTask: null,

        _model: null,
        _view: null,

        constructor: function() {
            this._model = new Stateful({
                task: null,
                jiraKey: null
            });

            this._view = new TimeEntryDetailsView({
                model: this._model,
                jiraStore: this.jiraStore
            });
            syncFrom(this, 'taskStore', this._view);
        },

        buildRendering: function() {
            this.domNode = this._view.domNode;
        },

        postCreate: function() {
            this.own(
                whenAllPropertiesSet(this, ["timeEntryStore", "taskStore"], lang.hitch(this, "_initialize"))
            );
        },
        
        _initialize: function() {
            this.own(
                this.watch("selectedId", lang.hitch(this, "_selectedIdChanged")),
                this._view.on("taskSelected", lang.hitch(this, "_taskSelected")),
                this._view.on("jiraSelected", lang.hitch(this, "_jiraSelected"))
            );
            this._selectedIdChanged(null, null, this.selectedId);
        },

        _selectedIdChanged: function(prop, prevValue, value) {
            if (value !== prevValue) {
                if (!value) {
                    this._view.hide();
                } else {
                    this._fillInFromId(value);
                    this._view.show();
                }
            }
        },

        _fillInFromId: function(timeEntryId) {
            this._timeEntryUpdateHandle && this._timeEntryUpdateHandle.remove();
            this.own(this._timeEntryUpdateHandle =
                    getAndObserve(this.timeEntryStore, timeEntryId, lang.hitch(this, function(timeEntry) {
                if (timeEntry.taskId) {
                    this._taskUpdateHandle && this._taskUpdateHandle.remove();
                    this.own(this._taskUpdateHandle =
                            getAndObserve(this.taskStore, timeEntry.taskId, lang.hitch(this, function (task) {
                        this._fillIn(timeEntry, task);
                    })));
                } else {
                    this._fillIn(timeEntry, null);
                }
            })));
        },

        _fillIn: function(timeEntry, task) {
            this.currentTimeEntry = timeEntry;
            this.currentTask = task;

            this._model.set('task', task);

            var jiraIntegration = Integrations.getIntegrationOfType(task, 'jira');
            if (jiraIntegration) {
                this._model.set('jiraKey', jiraIntegration.id);
            } else {
                this._model.set('jiraKey', null);
            }
        },

        _taskSelected: function(task) {
            var taskId = task ? task.id : null;
            if (!task) {
                // unset task from entry
                this._updateEntry({
                    taskId: null
                });
            } else if (task.id) {
                // existing task
                if (task.id !== this.currentTimeEntry.taskId) {
                    this._updateEntry({
                        taskId: task.id
                    });
                }
            } else if (task.description) {
                if (this.currentTask) {
                    // update existing task
                    this.currentTask.set('description', task.description);
                    this._createOrUpdateTask(this.currentTask);
                } else {
                    // new task
                    this._createTask({
                        description: task.description
                    }).then(lang.hitch(this, function (result) {
                        this._updateEntry({
                            taskId: result.taskId
                        });
                    }));
                }
            }
        },

        _jiraSelected: function(selectedJiraKey) {
            this._onJiraKeyChange(selectedJiraKey);
        },

        _onJiraKeyChange: function(key) {
            console.log("onJiraKeyChange", key);

            var task = this.currentTask;
            if (task) {
                if (key) {
                    var integration = Integrations.getOrAddIntegrationOfType(task, 'jira');
                    if (integration.id === key) {
                        return;
                    }
                    integration.id = key;
                } else {
                    if (!Integrations.removeIntegrationOfType(task, 'jira')) {
                        return;
                    }
                }

                this._updateTask(task).then(lang.hitch(this, '_updateTimeEntryAfterTaskChange', this.currentTimeEntry));
            } else {
                if (key) {
                    this._setTaskFromJiraKey(key);
                }
            }
        },

        _setTaskFromJiraKey: function(jiraKey) {
            var timeEntry = this.currentTimeEntry;

            when(this.jiraStore.get(jiraKey), lang.hitch(this, function(jiraItem) {
                var task = {
                    description: jiraItem.label
                };
                Integrations.getOrAddIntegrationOfType(task, 'jira').id = jiraKey;
                this._createTask(task).then(lang.hitch(this, '_updateTimeEntryAfterTaskChange', timeEntry));
            }));
        },

        _updateTimeEntryAfterTaskChange: function(timeEntry, taskUpdateResult) {
            var task = taskUpdateResult.task;
            var change = false;
            if (timeEntry.taskId !== task.id) {
                timeEntry.taskId = task.id;
                change = true;
            }

            if (change) {
                this._updateEntry(timeEntry);
            }
        },

        _createOrUpdateTask: function(task) {
            if (task.id) {
                return this._updateTask(task);
            } else {
                return this._createTask(task);
            }
        },

        _updateEntry: function(entry) {
            entry = lang.mixin({id: this.currentTimeEntry.id}, entry);
            return new UpdateTimeEntryCommand({timeEntry: entry}).exec();
        },

        _createTask: function(task) {
            return new CreateTaskCommand({task: task}).exec();
        },

        _updateTask: function(task) {
            return new UpdateTaskCommand({task: task}).exec();
        }

    });
});