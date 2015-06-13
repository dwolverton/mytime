/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "lodash", "dojo/_base/lang", "dojo/_base/declare",
    "dojo/when", "dojo/dom-construct",
    "dijit/_WidgetBase"
], function(
    _, lang, declare,
    when, domConstruct,
    _WidgetBase
    ) {
    /**
     * @class TransformingStoreView
     *
     * An EnhancedMemoryStore that mirrors the results of a query against another store, but contains a transformed
     * version of the elements in that other store. Additionally some items may be excluded.
     */
    return declare([_WidgetBase], {

        /**
         * Source store from which to draw items. Must be Observable.
         */
        store: null,

        /**
         * Optional query to use against the source store
         */
        query: null,

        /**
         * Optional query options to use against the source store (the second parameter to store.query())
         */
        queryOptions: null,

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
        renderNode: null,

        _observeHandle: null,

        postCreate: function() {
            var _refreshWatcher = lang.hitch(this, "_refreshWatcher");
            this.watch("store", _refreshWatcher);
            this.watch("query", _refreshWatcher);
            this.watch("queryOptions", _refreshWatcher);
            this.watch("renderNode", _refreshWatcher);
            this._refreshIfReady();
        },

        _refreshWatcher: function(property, oldValue, value) {
            if (value !== oldValue) {
                this._refreshIfReady();
            }
        },

        _refreshIfReady: function() {
            if (this.store && this.renderNode) {
                this.refresh();
            }
        },

        refresh: function() {
            if (this._observeHandle) {
                this._observeHandle.remove();
            }
            this.domNode.innerHTML = '';

            var queryResult = this.store.query(this.query, this.queryOptions);
            this._observeHandle = queryResult.observe(lang.hitch(this, "_observer"), true);

            when(queryResult, lang.hitch(this, function(results) {
                _.forEach(results, function(object, index) {
                    this._observer(object, -1, index);
                }, this);
            }));
        },

        _observer: function(object, previousIndex, newIndex) {
            if (previousIndex !== -1) {
                var nodeToRemove = this.domNode.childNodes[previousIndex];
                this.domNode.removeChild(nodeToRemove);
            }
            if (newIndex !== -1) {
                var nodeToAdd = this._convertToDomNode(this.renderNode(object));
                domConstruct.place(nodeToAdd, this.domNode, newIndex);
            }
        },

        _convertToDomNode: function(node) {
            if (!node) {
                return domConstruct.toDom("<!-- placeholder -->");
            } if (typeof node === 'string') {
                return domConstruct.toDom(node);
            } else {
                return node;
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