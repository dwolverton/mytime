/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "exports", "lodash", "dojo/_base/lang",
    "dojo/io-query"
],
function (exports, _, lang, ioQuery) {

    var cachedContext = undefined;

    /**
     * Methods for working with the context. Context allows working with independent sets of data in the same browser.
     * Set the context by setting a 'ctx' URL parameter.
     */
    lang.mixin(exports, {

        /**
         * Get the current context
         * @returns {string}
         */
        getContext: function() {
            if (_.isUndefined(cachedContext)) {
                cachedContext = null;

                var query = location.search;
                if (query) {
                    query = query.substring(1);
                }
                if (query) {
                    var queryObject = ioQuery.queryToObject(query);
                    cachedContext = queryObject.ctx || null;
                }
            }

            return cachedContext;
        },

        /**
         * Set the current context
         * @param {string} context
         */
        setContext: function(context) {
            if (context) {
                location.search = ioQuery.objectToQuery({ctx: context});
            } else {
                location.search = "";
            }
        }
    });
});