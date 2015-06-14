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
    "mytime/util/whenAllPropertiesSet", "mytime/util/syncFrom", "mytime/util/store/getAndObserve"
],
function (
    _, lang, declare, when, Stateful, Evented,
    _WidgetBase,
    TimeEntryDetailsView,
    JiraPicklistStore,
    UpdateTimeEntryCommand, CreateTaskCommand, UpdateTaskCommand,
    whenAllPropertiesSet, syncFrom, getAndObserve) {

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

            var jiraIntegration = this._getIntegrationOfType(task, 'jira');
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
            var entry = this.currentTimeEntry;
            if (key && !task) {
                task = {
                    description: this.jiraStore.get(key).label // TODO: will not work with async store
                };
            }

            if (!key) {
                if (!this._removeIntegrationOfType(task, 'jira')) {
                    return;
                }
            } else {
                var integration = this._getOrAddIntegrationOfType(task, 'jira');
                if (integration.id === key) {
                    return;
                }
                integration.id = key;
            }

            this._createOrUpdateTask(task).then(lang.hitch(this, function(result) {
                var task = result.task;
                var change = false;
                if (entry.taskId !== task.id) {
                    entry.taskId = task.id;
                    change = true;
                }
                // TODO here we need to update associated entries at some point

                if (change) {
                    this._updateEntry(entry);
                }
            }));
        },

        _getOrAddIntegrationOfType: function(object, type) {
            object.integrations = object.integrations || [];
            var integration = _.find(object.integrations, {type: type});
            if (!integration) {
                integration = {
                    type: type
                };
                object.integrations.push(integration);
            }
            return integration;
        },

        _getIntegrationOfType: function(object, type) {
            return _.find(object ? object.integrations : null, {type: type});
        },

        /**
         * Return true if found and removed.
         */
        _removeIntegrationOfType: function(object, type) {
            if (!object) {
                return false;
            }
            var index = _.findIndex(object.integrations, {type: type});
            if (index != -1) {
                object.integrations.splice(index, 1);
                return true;
            }
            return false;
        },

        _createOrUpdateTask: function(task) {
            if (task.id) {
                return new UpdateTaskCommand({task: task}).exec();
            } else {
                return new CreateTaskCommand({task: task}).exec();
            }
        },

        _updateEntry: function(entry) {
            entry = lang.mixin({id: this.currentTimeEntry.id}, entry);
            return new UpdateTimeEntryCommand({timeEntry: entry}).exec();
        },

        _createTask: function(task) {
            return new CreateTaskCommand({task: task}).exec();
        }

    });
});