/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "exports", "lodash", "dojo/_base/lang",
        "mytime/persistence/Context"
],
function (exports, _, lang, Context) {
    /**
     * Methods for interfacting with HTML5 Local Storage
     */
    lang.mixin(exports, {

        persistObject: function(key, object) {
            key = this._getKeyForContext(key);
            localStorage.setItem(key, JSON.stringify(object));
        },

        /**
         *
         * @param {string} key
         * @param {function} [constructor] if specified, the retrieved object will be passed into the constructor to
         *                   return an object of that type (optional - if not specified the raw persisted data is
         *                   returned.
         * @returns {*}
         */
        retrieveObject: function(key, constructor) {
            key = this._getKeyForContext(key);
            var object = localStorage.getItem(key);
            if (!object) {
                return null;
            }
            object = JSON.parse(object);
            if (constructor) {
                object = new constructor(object);
            }
            return object;
        },

        _getKeyForContext: function(key) {
            var context = Context.getContext();
            if (context) {
                return context + "~" + key;
            } else {
                return key;
            }
        },

        /**
         * Persist an array of objects
         * @param {string} key
         * @param {Array} data array of objects to persist
         */
        persistStoreData: function(key, data) {
            this.persistObject(key, data);
        },

        /**
         * Retrieve an array of objects
         * @param {string} key
         * @param {function} [constructor] if specified, each retrieved object in the array will be passed into this
         *                   constructor to return an object to be used (optional - if not specified the raw persisted
         *                   data is returned as is.
         * @returns {Array}
         */
        retrieveStoreData: function(key, constructor) {
            var data = this.retrieveObject(key) || [];
            if (constructor) {
                for (var i = 0; i < data.length; i++) {
                    data[i] = new constructor(data[i]);
                }
            }
            return data;
        },

        /**
         * Persist a synchronous store, such as a Memory store. The store is not modified.
         * @param {string} key
         * @param {dojo/Store} store
         */
        persistStore: function(key, store) {
            this.persistStoreData(key, store.query());
        },

        /**
         * Given an store, add the array data from storage into that store.
         * @param {string} key
         * @param {dojo/Store} store
         * @param {function} [constructor] (see retrieveStoreData())
         * @returns {*}
         */
        loadStore: function(key, store, constructor) {
            var data = this.retrieveStoreData(key, constructor);
            _.forEach(data, function(item) {
                store.add(item);
            });
            return store;
        },

        clear: function() {
            localStorage.clear();
        }
    });
});