/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "lodash", "dojo/_base/declare",
    "mytime/model/Task"
],
function (
    _, declare,
    Task
    ) {

    /**
     * A store used for TaskPickerCombo that wraps an underlying task store and emulates a '_searchText' property to
     * query against.
     */
    return declare([], {

        /**
         * Store that this store wraps. Expects a dojo/store/Memory.
         * @type dojo/store/Memory
         */
        store: null,

        /**
         * query string of current query used to process results
         */
        _queryString: null,
        /**
         * regular expression of current query used to process results
         */
        _beginningRegExp: null,

        constructor: function(store) {
            this.store = store;
        },

        get: function() {
            var task = this.store.get.apply(this.store, arguments);
            if (task) {
                task = new Task(task);
                task._searchText = task.description;
            }
            return task;
        },

        query: function(query) {
            var rawQuery = null;
            var queryString = query._searchText.toString();

            if (queryString) {
                var escapedQueryString = this._escapeRegExp(queryString);
                var beginningRegExp = new RegExp("(^|\\b)" + escapedQueryString, "i");

                rawQuery = function(task) {
                    return task.description && beginningRegExp.test(task.description);
                };

                this._beginningRegExp = beginningRegExp;
            } else {
                this._beginningRegExp = null;
                // This is a hack to cause dojo to be able to identify when there is no search string entered.
                // See _AutoCompleterMixin line 281. Really it can't support having queryExpr set to '${0}'.
                query._searchText.toString = function() { return "*" };
            }
            this._queryString = queryString;

            var options = {
//                sort: [{attribute: 'description', descending: true}]
            };
            var rawResults = this.store.query(rawQuery, options);

            return this._processResults(rawResults);
        },

        _processResults: function(results) {
            var processedResults = _.map(results, this._processResult, this);
            processedResults.reverse(); // Hack to improve sorting for now. In effect, puts most recently added first.
            processedResults.total = results.total;
            return processedResults;
        },

        /**
         * Due to the limitations of dojo ComboBox and auto-complete, we dynamically determine a _searchText value
         * for each task that will ensure the value in the combo box starts with the search text.
         */
        _processResult: function(task) {
            task = new Task(task);

            if (this._beginningRegExp) {
                task._searchText = this._buildSearchText(task);
            } else {
                task._searchText = task.description
            }

            return task;
        },

        _buildSearchText: function(task) {
            var locationInDescription = task.description && task.description.search(this._beginningRegExp);
            if (locationInDescription === 0) {
                return task.description;
            } else {
                return this._queryString + "  ~ " + task.description;
            }
        },

        _escapeRegExp: function(str) {
            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        }
    });
});