/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "dojo/_base/declare", "lodash",
    "dojo/store/Memory", "dojo/store/Observable",
    "./EnhancedMemoryStore.QueryEngine"
], function (
    declare, _,
    MemoryStore, Observable,
    QueryEngine
) {
    /**
     * Adds a few useful methods to Memory store.
     * @type {*}
     */
    var EnhancedMemoryStore = declare([MemoryStore], {

        queryEngine: QueryEngine,

        /**
         * Return number of items in the store
         */
        size: function() {
            return this.data.length;
        },

        /**
         * Remove all
         */
        clear: function() {
            // iterate from end to beginning so as not to change indices of items and trigger
            // many index change events via observable
            for(var i = this.data.length - 1; i >= 0; i--) {
                var id = this.getIdentity(this.data[i]);
                this.remove(id);
            }
        },

        /**
         * Shortcut for observing the entire store
         */
        observe: function(listener, includeObjectUpdates) {
            return this.query({}).observe(listener, includeObjectUpdates);
        }
    });

    EnhancedMemoryStore.createObservable = function(options) {
        return new Observable(new EnhancedMemoryStore(options));
    };

    return EnhancedMemoryStore;
});