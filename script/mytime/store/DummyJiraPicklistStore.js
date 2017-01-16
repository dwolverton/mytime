/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define(["lodash", "dojo/_base/declare", "dojo/_base/lang", "dojo/Deferred", "mytime/command/GetJiraPickListCommand"],
function (_, declare, lang, Deferred, GetJiraPickListCommand) {
    return declare([], {

        get: function(id) {
            if (!id) {
                return {
                    id: null,
                    description: '',
                    label: 'NONE'
                }
            }

            return {
                id: id,
                description: 'Created from ' + id,
                label: id
            }
        },

        query: function(query) {
            var id = this._normalizeQuery(query);

            return [
                this.get(id)
            ]
        },

        _normalizeQuery: function(query) {
            if (!query) {
                return null;
            } else if (typeof query === 'string') {
                return query;
            } else if (query.label) {
                return this._normalizeQuery(query.label.toString());
            } else {
                return null;
            }
        },

        getIdentity: function(object) {
            return object ? object.id : null;
        }
    });
});