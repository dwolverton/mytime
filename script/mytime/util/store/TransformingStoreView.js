/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "lodash", "dojo/_base/lang", "dojo/_base/declare",
    "dojo/Stateful", "dojo/when", "dojo/aspect", "dojo/store/Observable",
    "mytime/util/store/EnhancedMemoryStore", "mytime/util/store/delegateObserve"
], function(
    _, lang, declare,
    Stateful, when, aspect, Observable,
    EnhancedMemoryStore, delegateObserve
) {
    /**
     * @class TransformingStoreView
     *
     * An EnhancedMemoryStore that mirrors the results of a query against another store, but contains a transformed
     * version of the elements in that other store. Additionally some items may be excluded.
     *
     * NOTE: Because of an internal issue with Observable, this store cannot be observed by the normal means:
     * new Observable(transformingStoreView). Use getObservable() instead: transformingStoreView.getObservable();
     */
    return declare([EnhancedMemoryStore, Stateful], {

        /**
         * Source store from which to draw items. Must be Observable.
         */
        sourceStore: null,

        /**
         * Optional query to use against the source store
         */
        sourceQuery: null,

        /**
         * The function to use for transforming the items from the source store into items for this store. The source
         * store item is passed in, and the transformed item should be returned. If a falsy value is returned, nothing
         * will be added to this store, and in the case of update any existing corresponding item will be removed.
         *
         * For an update, the previous transformed object is also passed in as a second parameter.
         *
         * Note that the ID of the transformed item must be the same as the ID of the source item. However, the id
         * property name may be different, as set by the idProperty of this store.
         *
         * @type {function({*} sourceObject, {*} ?previousTransformedObject)}
         */
        transform: null,

        /**
         * Either this object or the observable created in getObservable() if it has been called. This is used to make
         * sure put, remove and add calls made internally are executed against the Observable when appropriate.
         */
        _pointerToThis: null,
        /**
         * The Observable created in getObservable(). Stored in order to return the same observable to subsequent calls.
         */
        _observable: null,

        _watchHandles: null,
        _observeHandle: null,

        /**
         * Because of complications with Observable, this store cannot be observed by the normal means:
         * new Observable(transformingStoreView). Use this function instead: transformingStoreView.getObservable();
         * @returns {Observable}
         */
        getObservable: function() {
            if (!this._observable) {
                this._observable = new Observable(this);
                this._pointerToThis = this._observable;
            }
            return this._observable;
        },
        /**
         * Override in order to direct either to Stateful.get or EnhancedMemoryStore.get since both mixed in methods
         * have the same name.
         */
        get: function(prop) {
            if (_.contains(["sourceStore", "sourceQuery", "transform"], prop)) {
                return Stateful.prototype.get.apply(this, arguments);
            } else {
                return EnhancedMemoryStore.prototype.get.apply(this, arguments);
            }
        },

        postscript: function() {
            this.inherited(arguments);
            this._pointerToThis = this;
            this._bindMethodsToPointerToThis();
            var _refreshWatcher = lang.hitch(this, "_refreshWatcher");
            this.watch("sourceStore", _refreshWatcher);
            this.watch("sourceQuery", _refreshWatcher);
            this.watch("transform", _refreshWatcher);
            this.refresh();
        },

        /**
         * In order to make everything work correctly we need all the methods to be fired in the context of the
         * observable (if any) rather than the underlying store. This method sets all the other methods up to make sure
         * they do that.
         * @private
         */
        _bindMethodsToPointerToThis: function() {
            _.forEach(["_refreshWatcher", "refresh", "refreshItem",
                    "_onInsert", "_onUpdate", "_onRemove"],
                function(fnName) {
                    var originalFn = this[fnName];
                    this[fnName] = function() {
                        originalFn.apply(this._pointerToThis, arguments);
                    }
            }, this);
        },

        _refreshWatcher: function(property, oldValue, value) {
            if (value !== oldValue) {
                this.refresh();
            }
        },

        refresh: function() {
            if (!this.sourceStore || !this.transform) {
                return;
            }

            if (this._observeHandle) {
                this._observeHandle.remove();
                this._observeHandle = null;
            }
            this.clear();

            var queryResult = this.sourceStore.query(this.sourceQuery);
            this._observeHandle = queryResult.observe(delegateObserve("_onInsert", "_onRemove", "_onUpdate", this), true);

            when(queryResult, lang.hitch(this, function(results) {
                _.forEach(results, lang.hitch(this, "_onInsert"));
            }));
        },

        refreshItem: function(id) {
            var object = this._getItemFromSourceStoreIfMatchesSourceQuery(id);
            if (object) {
                this._onUpdate(object);
            } else {
                this.remove(id);
            }
        },

        _getItemFromSourceStoreIfMatchesSourceQuery: function(id) {
            var object = this.sourceStore.get(id);
            if (object && this.sourceQuery) {
                var queryResult = this.sourceStore.query(this.sourceQuery);
                if (_.contains(queryResult, object)) {
                    return object;
                } else {
                    return null;
                }
            } else {
                return object;
            }
        },

        _onInsert: function(object) {
            var transformed = this.transform(object);
            if (transformed) {
                this.put(transformed);
            }
        },

        _onUpdate: function(object) {
            var id = this.sourceStore.getIdentity(object);
            var previous = id && this.get(id);
            var transformed = this.transform(object, previous);
            if (transformed) {
                this.put(transformed);
            } else {
                this.remove(id);
            }
        },

        _onRemove: function(object) {
            var id = this.sourceStore.getIdentity(object);
            if (id) {
                this.remove(id);
            }
        },

        destroy: function() {
            this.inherited(arguments);
            if (this._observeHandle) {
                this._observeHandle.remove();
            }
        }

    });

});