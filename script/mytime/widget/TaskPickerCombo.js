/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "lodash", "dojo/_base/lang", "dojo/_base/declare",
    "dijit/form/ComboBox",
    "mytime/command/CreateTaskCommand", "mytime/model/Task",
    "mytime/util/Colors",
    "mytime/widget/TaskPickerComboStore"
],
function (
    _, lang, declare,
    ComboBox,
    CreateTaskCommand, Task,
    Colors,
    TaskPickerComboStore
    ) {
    return declare([ComboBox], {

        searchAttr: "_searchText",

        labelType: "html",

        queryExpr: "${0}",

        constructor: function() {
            this.baseClass += " taskpicker";
        },

        _getTaskAttr: function() {
            return this.get("item");
        },

        _setTaskAttr: function(task) {
            if (task) {
                task = new Task(task);
                task._searchText = Task.getDisplayText(task);
            }
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
            if (!this.item && newStringValue) {
                var task = this._parseStringToTask(newStringValue);
                if (task) {
                    new CreateTaskCommand({task: task}).exec().then(lang.hitch(this, function(result) {
                        this.set("task", result.task);
                    }));
                }
            }
        },

        _parseStringToTask: function(string) {
            string = string.trim();
            if (string.length === 0) {
                return null;
            }

            var task = {
                code: string
            };
            var firstSpace = string.indexOf(' ');
            if (firstSpace > -1) {
                task.code = string.substring(0, firstSpace);
                task.name = string.substring(firstSpace + 1).trim();
                if (task.name.length < 1) {
                    delete task.name;
                }
            }
            return this._isValidCode(task.code) ? task : null;
        },

        _isValidCode: function(code) {
            return code && code.length > 1;
        },

        labelFunc: function(item, store) {
            return '<span class="task" style="color: ' + Colors.dark(item.color) + '"><span class="code">' +
                _.escape(item.code) + '</span> <span class="name">' + _.escape(item.name || "") + '</span></span>';
        },

        focusAndSelectAll: function() {
            this.focus();
            this.focusNode.select();
        }
    });
});