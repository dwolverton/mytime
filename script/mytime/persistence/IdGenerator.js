/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define(["./LocalStorage"],
function (LocalStorage) {

    var lastIdByType = {
        'TimeEntry': LocalStorage.retrieveObject("lastTimeEntryId") || 0,
        'Task': LocalStorage.retrieveObject("lastTaskId") || 0
    };

    return {
        nextIdForType: function(type) {
            var id = ++lastIdByType[type];
            LocalStorage.persistObject("last" + type + "Id", id);
            return String((id));
        }
    }
});