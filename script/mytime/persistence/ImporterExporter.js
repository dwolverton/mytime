/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "dojo/_base/declare", "dojo/json",
    "mytime/model/TimeEntry"
],
function (declare, json, TimeEntry) {
    return declare([], {
        importStringToStore: function(string, store) {
            var objectList = json.parse(string);
            _.forEach(objectList, function(object) {
                store.put(new TimeEntry(object));
            });
            return store;
        },

        exportStoreToString: function(store) {
            var objectList = [];
            _.forEach(store.query({}), function(timeEntry) {
                var object = {};
                object.id = timeEntry.get("id");
                object.date = timeEntry.get("date");
                object.startHour = timeEntry.get("startHour");
                object.endHour = timeEntry.get("endHour");
                object.text = timeEntry.get("text");
                objectList.push(object);
            });
            return json.stringify(objectList).replace(/},/g, "},\n");
        }
    });
});