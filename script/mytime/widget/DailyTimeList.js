/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "lodash", "dojo/_base/lang", "dojo/_base/declare", "dojo/when",
    "dojo/dom-construct", "dojo/dom-class", "dojo/dom-attr", "dojo/on", "dojo/query", "dojo/Evented", "dojo/dom",
    "dijit/_WidgetBase", "dijit/form/Textarea", "dijit/focus",
    "mytime/widget/TaskPickerCombo", "mytime/widget/TaskDialog",
    "mytime/model/TimeEntry",
    "mytime/command/UpdateTimeEntryCommand", "mytime/command/UpdateTaskCommand",
    "mytime/util/Colors", "mytime/util/whenAllPropertiesSet", "mytime/util/store/TransformingStoreView",
    "mytime/util/store/StoreDrivenDom", "mytime/util/DateTimeUtil", "mytime/util/jira",
    "dojo/text!mytime/widget/DailyTimeList/templates/entry.html",
    "dojo/text!mytime/widget/DailyTimeList/templates/entry-edit.html"
],
function (
    _, lang, declare, when,
    domConstruct, domClass, domAttr, on, query, Evented, dom,
    _WidgetBase, Textarea, focusUtil,
    TaskPickerCombo, TaskDialog,
    TimeEntry,
    UpdateTimeEntryCommand, UpdateTaskCommand,
    Colors, whenAllPropertiesSet, TransformingStoreView,
    StoreDrivenDom, DateTimeUtil, jira,
    template, editTemplate) {

    /**
     *
     */
    return declare([_WidgetBase, Evented], {

        baseClass: "timelist",

        date: null,
        timeEntryStore: null,
        taskStore: null,

        selectedId: null,
        editingId: null,
        _editingStartData: null,

        _internalStore: null,
        _list: null,

        _taskCombo: null,
        _notesBox: null,

        buildRendering: function() {
            this.inherited(arguments);
        },

        postCreate: function() {
            var _this = this;
            this.own(
                whenAllPropertiesSet(this, ["date", "timeEntryStore", "taskStore"], lang.hitch(this, "_initialize")),
                on(this.domNode, on.selector(".task, .note, .menu-button", "click"), function(event) {
                    // NOTE: for 'on' with selector, 'this' is the node identified by the selector.
                    _this._onEntryClick(event, this);
                }),
                on(document, 'mouseup', lang.hitch(this, '_onClickElsewhere'))
            );
        },
        
        _initialize: function() {
            this._setupTaskCombo();
            this._setupNotesBox();
            this._internalStore = new TransformingStoreView({
                sourceStore: this.timeEntryStore,
                sourceQuery: {date: this.date},
                transform: lang.hitch(this, function(input) {
                    var entry = new TimeEntry(input);
                    entry.selected = entry.id === this.selectedId;
                    entry.editing = entry.id === this.editingId;
                    return entry;
                })
            }).getObservable();
            this._list = new StoreDrivenDom({
                store: this._internalStore,
                queryOptions: {sort: [{attribute: "startHour"}]},
                renderNode: lang.hitch(this, "_renderEntry")
            });

            this._list.placeAt(this.domNode);

            this.own(
                this.watch("date", lang.hitch(this, "_dateChanged")),
                this.watch("editingId", lang.hitch(this, "_editingOrSelectedIdChanged")),
                this.watch("selectedId", lang.hitch(this, "_editingOrSelectedIdChanged"))
            );
        },

        _setupTaskCombo: function() {
            this._taskCombo = new TaskPickerCombo({
                store: this.taskStore
            });
            this.own(
                on(this._taskCombo, "change", lang.hitch(this, "_onTaskComboChange"))
            );
        },

        _setupNotesBox: function() {
            this._notesBox = new Textarea();
            this.own(
                on(this._notesBox, "change", lang.hitch(this, "_onNotesBoxChange"))
            );
        },

        _renderEntry: function(timeEntry) {
            var task = null;
            if (timeEntry.taskId) {
                task = this.taskStore.get(timeEntry.taskId);
            }
            return this._renderEntryWithTask(timeEntry, task);
        },

        _renderEntryWithTask: function(timeEntry, task) {
            var data = {
                Colors: Colors,
                timeEntryId: timeEntry.id,
                taskId: "",
                text: timeEntry.text || "",
                duration: DateTimeUtil.duration(timeEntry),
                code: "[   ]",
                name: "No Task",
                color: null,
                selected: timeEntry.selected,
                jiraLoggingUrl: ""
            };
            if (task) {
                data.taskId = task.id || "";
                data.code = task.code || "";
                data.name = task.name || "";
                data.color = task.color || null;
                if (jira.isJiraIssueKey(task.code)) {
                    data.jiraLoggingUrl = jira.buildTimeLoggingLink(task.code, timeEntry);
                }
            }
            if (timeEntry.editing) {
                return this._renderEditingEntry(timeEntry, task, data);
            } else {
                var html = _.template(template, data);
                return domConstruct.toDom(html);
            }
        },

        _renderEditingEntry: function(timeEntry, task, data) {
            var html = _.template(editTemplate, data);
            var dom = domConstruct.toDom(html);

            this._editingStartData = {
                taskId: task ? task.id : null,
                text: timeEntry.text
            };

            var comboContainer = query(".task", dom)[0];
            this._taskCombo.set("task", task);
            this._taskCombo.placeAt(comboContainer);
            this._taskCombo.startup();

            var noteContainer = query(".note", dom)[0];
            this._notesBox.set("value", timeEntry.text);
            this._notesBox.placeAt(noteContainer);
            this._notesBox.startup();

            return dom;
        },

        _dateChanged: function() {
            this._internalStore.set("sourceQuery", {date: this.date});
        },

        _onEntryClick: function(event, node) {
            var entryNode = this._getTimeEntryNodeContaining(node);
            var entryId = domAttr.get(entryNode, "data-timeentry-id");
            var taskId = domAttr.get(entryNode, "data-task-id");

            if (domClass.contains(node, 'task') || domClass.contains(node, 'note')) {
                this.set("selectedId", entryId);
                this.set("editingId", entryId);
            } else if (domClass.contains(node, 'menu-button')) {
                this._onMenuClick(node, entryId, taskId);
            }
        },

        _getTimeEntryNodeContaining: function(node) {
            do {
                if (domClass.contains(node, 'timeentry')) {
                    return node;
                }
                node = node.parentNode;
            } while (node);
            return null;
        },

        _onMenuClick: function(buttonNode, entryId, taskId) {
            if (!taskId) {
                return;
            }
            when(this.taskStore.get(taskId), function(task) {
                var dialog = new TaskDialog({value: task});
                dialog.showAndWaitForUser().then(function(task) {
                    dialog.destroy();
                    new UpdateTaskCommand({task: task}).exec();
                }, function() {
                    dialog.destroy();
                });
            });
        },

        _editingOrSelectedIdChanged: function(prop, prevValue, value) {
            if (value !== prevValue) {
                if (prevValue) {
                    this._internalStore.refreshItem(prevValue);
                }
                if (value) {
                    this._internalStore.refreshItem(value);
                    if (prop === "editingId") {
                        this._taskCombo.focusAndSelectAll();
                    }
                }
            }
        },

        _onTaskComboChange: function() {
            var task = this._taskCombo.get('task');
            var taskId = task ? task.id : null;
            if (taskId !== this._editingStartData.taskId) {
                this._editingStartData.taskId = taskId;
                new UpdateTimeEntryCommand({timeEntry: {
                    id: this.editingId,
                    taskId: taskId
                }}).exec();
            }
        },

        _onNotesBoxChange: function() {
            var text = this._notesBox.get('value');
            if (text !== this._editingStartData.text) {
                this._editingStartData.text = text;
                new UpdateTimeEntryCommand({timeEntry: {
                    id: this.editingId,
                    text: text
                }}).exec();
            }
        },

        /**
         * Hide the editor when clicking outside this widget.
         */
        _onClickElsewhere: function(event) {
            if (!this.editingId) {
                return;
            }
            if (_.contains(focusUtil.activeStack, this._taskCombo.id) ||
                _.contains(focusUtil.activeStack, this._notesBox.id)) {
                return;
            }
            if (event.target === this.domNode || dom.isDescendant(event.target, this.domNode)) {
                return;
            }
            this.set('editingId', null);
        }

    });
});