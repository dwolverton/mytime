/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define(["lodash", "dojo/_base/declare", "dojo/string"],
function (_, declare, string) {

    return declare([], {
        method: 'put',
        url: '/api/tasks/${id}',

        constructor: function(task) {
            this.url = string.substitute(this.url, task);
            this.data = {
                description: task.description,
                color: task.color
            }
        }
    });
});
