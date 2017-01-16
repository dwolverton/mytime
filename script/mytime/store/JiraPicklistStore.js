/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define(["lodash", "dojo/_base/declare", "dojo/_base/lang", "dojo/Deferred", "mytime/command/GetJiraPickListCommand"],
function (_, declare, lang, Deferred, GetJiraPickListCommand) {
    return declare([], {

        get: function(id) {
            return this.query(id).then(function(results) {
                return results.length == 1 ? results[0] : null;
            });
        },

        query: function(query) {
            query = this._normalizeQuery(query);
            var deferred = new Deferred();
            new GetJiraPickListCommand({query: query}).exec().then(function(results) {
                _.forEach(results, function(item) {
                    item.label = item.id + ' ' + item.description;
                });
                deferred.resolve(results);
            });
            return deferred;
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