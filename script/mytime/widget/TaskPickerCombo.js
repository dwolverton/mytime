/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "lodash", "dojo/_base/lang", "dojo/_base/declare", "dojo/on",
    "dijit/form/ComboBox",
    "mytime/command/CreateTaskCommand", "mytime/model/Task",
    "mytime/util/Colors",
    "mytime/widget/TaskPickerComboStore"
],
function (
    _, lang, declare, on,
    ComboBox,
    CreateTaskCommand, Task,
    Colors,
    TaskPickerComboStore
    ) {
    return declare([ComboBox], {

        searchAttr: "_searchText",

        labelType: "html",

        queryExpr: "${0}",

        _lastTask: null,

        constructor: function() {
            this.baseClass += " taskpicker";
        },

        _getTaskAttr: function() {
            var task = this.get("item");
            if (!task) {
                task = this._parseStringToTask(this.get('value'));
            }
            return task;
        },

        _setTaskAttr: function(task) {
            if (task) {
                task = new Task(task);
                task._searchText = task.description;
            }
            this._lastTask = task;
            this.set("item", task);
        },

        _setStoreAttr: function(store) {
            if (!(store instanceof TaskPickerComboStore)) {
                store = new TaskPickerComboStore(store);
            }
            this.inherited('_setStoreAttr', [store]);
        },

        _handleOnChange: function(newStringValue) {
            this.inherited(arguments);
            //if (this.item && this.item.description != newStringValue) {
            //    this.set('value', this.item.description);
            //}
        },

        postCreate: function() {
            this.inherited(arguments);
            this.own(
                on(this, "change", lang.hitch(this, '_checkForChange'))
            );
        },

        _checkForChange: function() {
            var task = this.get('task');
            var taskId = task ? task.id : null;
            var taskDescription = task ? task.description : null;
            if (this._lastTask) {
                if (this._lastTask.id !== taskId || this._lastTask.description !== taskDescription) {
                    this._lastTask = task;
                    this.onUserchange(task);
                }
            } else {
                if (taskDescription) {
                    this._lastTask = task;
                    this.onUserchange(task);
                }
            }

            var expectedDescription = task ? task.description : '';
            if (this.get('value') !== expectedDescription) {
                this.set('task', task);
            }
        },

        _parseStringToTask: function(string) {
            string = string.trim();
            if (string.length === 0) {
                return null;
            }

            var task = {
                description: string
            };
            return this._isValidDescription(task.description) ? task : null;
        },

        _isValidDescription: function(description) {
            return description && description.length > 1;
        },

        labelAttr: "description",

        focusAndSelectAll: function() {
            this.focus();
            this.focusNode.select();
        },

        onUserchange: function(task) {}
    });
});