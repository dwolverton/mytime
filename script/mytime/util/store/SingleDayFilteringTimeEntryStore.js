/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "lodash",
    "dojo/_base/declare", "dojo/_base/lang",
    "mytime/util/store/EnhancedMemoryStore", "mytime/util/_StatefulSettersMixin", "mytime/util/setIfDifferent",
    "mytime/model/TimeEntry"
],
function (_, declare, lang, EnhancedMemoryStore, _StatefulSettersMixin, setIfDifferent, TimeEntry) {

    /**
     * A read-only store that provides a filtered view of another store containing time entries. It only includes time
     * entries that have the specified date and are within the hours of of the specified start and end hours. If a time
     * entry is partially within the start and end hours, the store will contain a version of the time entry that has
     * start and end hour indicating only the portion of the time entry that falls within the specified bounds.
     */
    return declare([EnhancedMemoryStore, _StatefulSettersMixin], {

        date: null,

        startHour: 7,

        endHour: 19,

        sourceStore: null,

        _queryResults: null,
        _sourceStoreObserverHandle: null,

        _sourceStoreSetter: function(store) {
            if (store !== this.sourceStore || !this._isSourceStoreRegistered()) {
                this.sourceStore = store;
                if (this.date) {
                    this._registerSourceStore(store);
                }
            }
        },

        _dateSetter: function(date) {
            if (date !== this.date) {
                this.date = date;
                if (this.sourceStore) {
                    // re-register the store with the new date for the query.
                    this._registerSourceStore(this.sourceStore);
                }
            }
        },

        _startHourSetter: function(startHour) {
            if (startHour !== this.startHour) {
                this.startHour = startHour;
                this._refresh();
            }
        },

        _endHourSetter: function(endHour) {
            if (endHour !== this.endHour) {
                this.endHour = endHour;
                this._refresh();
            }
        },

        _isSourceStoreRegistered: function() {
            return this._sourceStoreObserverHandle != null;
        },

        _registerSourceStore: function(store) {
            if (this._isSourceStoreRegistered()) {
                this._sourceStoreObserverHandle.remove();
                this._queryResults = null;
            }
            if (store) {
                this._queryResults = store.query({date: this.date});
                this._sourceStoreObserverHandle = this._queryResults.observe(lang.hitch(this, "_sourceStoreListener"), true);
            }
            this._refresh();
        },

        _refresh: function() {
            this.clear();
            if (this._queryResults) {
                _.forEach(this._queryResults, lang.hitch(this, "_handleTimeEntryAdded"));
            }
        },

        _sourceStoreListener: function(timeEntry, removedFrom, insertedInto) {
            if (removedFrom === -1) {
                this._handleTimeEntryAdded(timeEntry);
            } else if (insertedInto === -1) {
                this._handleTimeEntryRemoved(timeEntry);
            } else if (removedFrom === insertedInto) {
                this._handleTimeEntryModified(timeEntry);
            }
        },

        _handleTimeEntryAdded: function(timeEntry) {
            if (!this._isInFilterRange(timeEntry)) {
                return;
            }

            var clonedEntry = new TimeEntry({
                id: timeEntry.id,
                startHour: this._constrainStartHour(timeEntry.startHour),
                endHour: this._constrainEndHour(timeEntry.endHour),
                color: timeEntry.color
            });

            this.put(clonedEntry);
        },

        _isInFilterRange: function(timeEntry) {
            return timeEntry.date === this.date
                && timeEntry.startHour < this.endHour + 1
                && timeEntry.endHour > this.startHour;
        },

        _handleTimeEntryRemoved: function(timeEntry) {
            if (this.get(timeEntry.id)) {
                this.remove(timeEntry.id);
            }
        },

        _handleTimeEntryModified: function(timeEntry) {
            var internal = this.get(timeEntry.id);
            if (!internal) {
                this._handleTimeEntryAdded(timeEntry);
                return;
            }
            if (!this._isInFilterRange(timeEntry)) {
                this._handleTimeEntryRemoved(timeEntry);
                return;
            }

            this._handleChangesToTimeEntry(internal, timeEntry);
        },

        _handleChangesToTimeEntry: function(internalTimeEntry, timeEntry) {
            var startHour = this._constrainStartHour(timeEntry.startHour);
            var endHour = this._constrainEndHour(timeEntry.endHour);
            setIfDifferent(internalTimeEntry, "startHour", startHour);
            setIfDifferent(internalTimeEntry, "endHour", endHour);
            this.put(timeEntry);
        },

        _constrainStartHour: function(startHour) {
            return Math.max(startHour, this.startHour);
        },

        _constrainEndHour: function(endHour) {
            return Math.min(endHour, this.endHour + 1);
        }

    });
});