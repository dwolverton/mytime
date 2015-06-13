/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "lodash",
    "dojo/_base/lang", "dojo/_base/declare", "dojo/Evented",
    "dijit/_WidgetBase",
    "mytime/model/TimeEntry",
    "mytime/util/DateTimeUtil", "mytime/util/syncFrom",
    "mytime/widget/DailyTimeWidget/DailyTimeWidgetView", "mytime/widget/DailyTimeWidget/DailyTimeWidgetStore"
],
function (
    _, lang, declare, Evented,
    _WidgetBase,
    TimeEntry,
    DateTimeUtil, syncFrom,
    DailyTimeWidgetView, DailyTimeWidgetStore
) {

    /**
     * inputs:
     * - timeEntryStore, date
     * emits:
     * - createTimeEntry, updateTimeEntry, deleteTimeEntry
     */
    return declare([_WidgetBase, Evented], {

        declaredClass: "DailyTimeWidget",

        /**
         * @type {string} yyyy-mm-dd
         */
        date: null,

        startHour: 6,

        endHour: 23,

        timeEntryStore: null,
        taskStore: null,

        marginForResizeHandle: 0.05,

        selectedId: null,

        nowHour: 0,
        endOfDayHour: 0,
        
        _internalStore: null,

        _view: null,

        _queryResults: null,
        _timeEntryStoreObserverHandle: null,

        constructor: function() {
            this._internalStore = new DailyTimeWidgetStore().getObservable();
            this.own(
                syncFrom(this, "date", this._internalStore),
                syncFrom(this, "startHour", this._internalStore),
                syncFrom(this, "endHour", this._internalStore),
                syncFrom(this, "taskStore", this._internalStore),
                syncFrom(this, "timeEntryStore", this._internalStore, "sourceStore"),
                syncFrom(this, "selectedId", this._internalStore)
            );
            this._view = new DailyTimeWidgetView({
                model: this
            });
        },

        buildRendering: function() {
            this.domNode = this._view.domNode;
        },

        postCreate: function() {
            this.own(
                this._view.on("endDrag", lang.hitch(this, "_endDragListener")),
                this._view.on("click", lang.hitch(this, "_clickListener")),
                this.watch("date", lang.hitch(this, "_updateNowHour"))
            );

            var handle = setInterval(lang.hitch(this, "_updateNowHour"), 15000);
            this.own({ remove: function() { clearInterval(handle) } });
            this._updateNowHour();
        },

        _endDragListener: function(event) {
            var entryAtStartOfDrag = this._findEntryContainingHour(event.startHour);
            if (entryAtStartOfDrag) {
                var startOrEnd = this._isHourAtStartOrEndOfEntry(entryAtStartOfDrag, event.startHour);
                if (startOrEnd) {
                    this._doEndDragAdjust(event, entryAtStartOfDrag, startOrEnd);
                } else {
                    this._doEndDragMove(event, entryAtStartOfDrag);
                }
            } else {
                this._doEndDragCreate(event);
            }
        },

        _clickListener: function(hour) {
            var entry = this._findEntryContainingHour(hour);
            if (entry && entry.id !== this.selectedId) {
                this.set("selectedId", entry.id);
            }
        },

        _findEntryContainingHour: function(hour) {
            var result = null;
            _.forEach(this._internalStore.query({}), function(entry) {
                if (hour > entry.startHour && hour < entry.endHour) {
                    result = entry;
                    return false; //exit loop
                }
            });
            return result;
        },

        _isHourAtStartOrEndOfEntry: function(timeEntry, hour) {
            if (hour < timeEntry.startHour + this.marginForResizeHandle) {
                return "start";
            } else if (hour > timeEntry.endHour - this.marginForResizeHandle) {
                return "end";
            } else {
                return false;
            }
        },

        _doEndDragCreate: function(event) {
            var timeEntry = this._createTimeEntryFromDragEvent(event);

            if (timeEntry.startHour === timeEntry.endHour) {
                return; // The selected range is too small.
            }

            this.emit("createTimeEntry", {
                timeEntry: timeEntry
            });
        },

        _doEndDragAdjust: function(event, timeEntry, startOrEnd) {
            timeEntry = this.timeEntryStore.get(timeEntry.id);
            var modifiedTimeEntry = new TimeEntry({
                id: timeEntry.get("id"),
                startHour: timeEntry.get("startHour"),
                endHour: timeEntry.get("endHour")
            });

            var destinationHour = this._roundTimeToTicks(event.endHour, event);
            var propertyToModify = startOrEnd + "Hour";
            if (destinationHour === timeEntry.get(propertyToModify)) {
                return; // Didn"t change significantly.
            }
            modifiedTimeEntry.set(propertyToModify, destinationHour);
            if (modifiedTimeEntry.get("startHour") === modifiedTimeEntry.get("endHour")) {
                // adjusted to zero time... Just delete it.
                this.emit("deleteTimeEntry", {
                    timeEntryId: modifiedTimeEntry.get("id")
                });
            } else {
                this.emit("updateTimeEntry", {
                    timeEntry: modifiedTimeEntry
                });
            }
        },

        _doEndDragMove: function(event, timeEntry) {
            var diff = event.endHour - event.startHour;
            diff = this._roundTimeToTicks(diff, event);
            if (diff === 0) {
                return; // Didn"t change significantly.
            }

            timeEntry = this.timeEntryStore.get(timeEntry.id);
            var modifiedTimeEntry = new TimeEntry({
                id: timeEntry.get("id"),
                startHour: timeEntry.get("startHour") + diff,
                endHour: timeEntry.get("endHour") + diff
            });

            this.emit("updateTimeEntry", {
                timeEntry: modifiedTimeEntry
            });
        },

        _createTimeEntryFromDragEvent: function(event) {
            var timeEntry = new TimeEntry({
                date: this.date,
                startHour: Math.min(event.startHour, event.endHour),
                endHour: Math.max(event.startHour, event.endHour)
            });

            timeEntry.startHour = this._roundTimeToTicks(timeEntry.startHour, event);
            timeEntry.endHour = this._roundTimeToTicks(timeEntry.endHour, event);

            return timeEntry;
        },

        _roundTimeToTicks: function(time, event) {
            if (event.alternate) {
                return DateTimeUtil.roundToFiveMinutes(time);
            } else {
                return DateTimeUtil.roundToFifteenMinutes(time);
            }
        },

        _updateNowHour: function() {
            if (this.date === DateTimeUtil.getCurrentDate()) {
                this.set("nowHour", DateTimeUtil.getHourFromDate(new Date()));
            } else {
                this.set("nowHour", -1);
            }
        }

    });
});