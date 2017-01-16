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
            return this.get("jiraIssue");
        },

        _setTaskAttr: function(task) {
            if (task) {
                task = new Task(task);
                task._searchText = task.description;
            }
            this.set("jiraIssue", task);
        },

        labelFunc: function(item, store) {
            return _.escape(item.description);
        },

        focusAndSelectAll: function() {
            this.focus();
            this.focusNode.select();
        }
    });
});