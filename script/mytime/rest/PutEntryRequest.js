/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define(["lodash", "dojo/_base/declare", "dojo/string"],
function (_, declare, string) {

    return declare([], {
        method: 'put',
        url: '/api/entries/${id}',

        constructor: function(entry) {
            this.url = string.substitute(this.url, entry);
            this.data = {
                taskId: entry.taskId,
                start: entry.date + "T" + entry.startHour + ":00:00",
                length: (entry.endHour - entry.startHour) * 60
            }
        }
    });
});

