/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define(["lodash", "dojo/_base/declare", "dojo/Deferred"],
function (_, declare, Deferred) {

    return declare([Deferred], {
        method: "get",
        url: "/api/integrations/jira",

        constructor: function(queryString) {
            this.inherited(arguments, []);
            if (queryString) {
                this.query = { "q": queryString }
            }
        }
    });
});

