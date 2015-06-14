/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "dojo/when"
], function(
    when
) {
    /**
     * calls the callback with the item by ID from a store and calls the callback again any time the object is added,
     * removed or modified in the store.
     *
     * @param {store} store an observable store
     * @param {id} ID of the item to retrieve from the store
     * @Param {function(item)} callback the function to call immediately on fetching the item by ID and again if
     *        modified. The argument to the callback is the item (null or undefined if not found or removed).
     * @return {{remove: function}} handle to stop the
     */
    return function(store, id, callback) {
        var query = {};
        query[store.idProperty || 'id'] = id;
        var results = store.query(query);

        var handle;
        if (typeof results.observe === 'function') {
            handle = results.observe(function(object, previousIndex, newIndex) {
                if (newIndex == -1) {
                    callback(null);
                } else {
                    callback(object);
                }
            }, true);
        } else {
            handle = { remove: _.noop }
        }
        when(results, function(results) {
            callback(results[0]);
        });
        return handle;
    };
});