/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "dojo/_base/lang"
], function(
    lang
) {
    /**
     * provides an listener function for an Observable.observe() that delegates to three other functions depending on
     * whether the operation is a insert, update or remove.
     * @param {?function(object, newIndex)|string} insertListener called when an item is inserted.
     * @param {?function(object, previousIndex)|string} removeListener called when an item is removed.
     * @param {?function(object, previousIndex, newIndex)|string} updateListener called when an item is updated/moved.
     * @param {*} thisObject context with which to call the callbacks. If specified, the callbacks could also be strings
     *        identifying methods on thisObject
     */
    return function(insertListener, removeListener, updateListener, thisObject) {
        if (thisObject) {
            insertListener = insertListener && lang.hitch(thisObject, insertListener);
            removeListener = removeListener && lang.hitch(thisObject, removeListener);
            updateListener = updateListener && lang.hitch(thisObject, updateListener);
        }
        return function(object, previousIndex, newIndex) {
            if (previousIndex === -1) {
                insertListener && insertListener(object, newIndex);
            } else if (newIndex == -1) {
                removeListener && removeListener(object, previousIndex);
            } else {
                updateListener && updateListener(object, previousIndex, newIndex);
            }
        };
    };
});