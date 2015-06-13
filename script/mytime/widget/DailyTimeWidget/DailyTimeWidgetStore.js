define([
    "dojo/_base/lang", "dojo/_base/declare",
    "mytime/util/store/TransformingStoreView",
    "mytime/model/TimeEntry"
], function(
    lang, declare,
    TransformingStoreView,
    TimeEntry
) {
    return declare([TransformingStoreView], {

        taskStore: null,

        date: "",
        startHour: 0,
        endHour: 24,

        selectedId: null,

        sourceQuery: {
            date: "match-none-until-initialized"
        },
        
        _dateSetter: function(value) {
            this._changeAttrValue("date", value);
            this.set("sourceQuery", {
                date: value
            });
        },

        postscript: function() {
            this.inherited(arguments);
            this.watch("startHour", lang.hitch(this, "refresh"));
            this.watch("endHour", lang.hitch(this, "refresh"));
            this.watch("taskStore", lang.hitch(this, "refresh"));
            this.watch("selectedId", lang.hitch(this, "_selectedIdChanged"));
        },

        transform: function(timeEntry) {
            if (!this._isInTimeRange(timeEntry)) {
                return null;
            }
            timeEntry = new TimeEntry(timeEntry);
            timeEntry.selected = (timeEntry.id === this.selectedId);
            timeEntry.startHour = this._constrainStartHour(timeEntry.startHour);
            timeEntry.endHour = this._constrainEndHour(timeEntry.endHour);
            if (timeEntry.taskId && this.taskStore) {
                var task = this.taskStore.get(timeEntry.taskId);
                if (task) {
                    timeEntry.color = task.color;
                    timeEntry.code = task.code;
                }
            }
            return timeEntry;
        },

        _isInTimeRange: function(timeEntry) {
            return timeEntry.startHour < this.endHour + 1
                && timeEntry.endHour > this.startHour;
        },

        _constrainStartHour: function(startHour) {
            return Math.max(startHour, this.startHour);
        },

        _constrainEndHour: function(endHour) {
            return Math.min(endHour, this.endHour + 1);
        },

        _selectedIdChanged: function(prop, oldValue, value) {
            if (oldValue !== value) {
                if (oldValue) {
                    this.refreshItem(oldValue);
                }
                if (value) {
                    this.refreshItem(value);
                }
            }
        }

    });
});