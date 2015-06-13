/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "dojo/_base/declare",
    "lodash",
    "dojo/_base/lang",
    "dojo/string", "dojo/on", "dojo/query",
    "dojo/dom-construct", "dojo/dom-class", "dojo/dom-style", "dojo/dom-geometry", "dojo/date/locale",
    "dojo/Evented",
    "dijit/_WidgetBase", "dijit/_TemplatedMixin",
    "mytime/util/DateTimeUtil", "mytime/util/Colors",
    "dojo/text!./templates/grid.html",
    "dojo/text!./templates/gridrow.html"
],
function (declare,
          _,
          lang,
          stringUtil, on, query,
          domConstruct, domClass, domStyle, domGeom, dateLocale,
          Evented,
          _WidgetBase, _TemplatedMixin,
          DateTimeUtil, Colors,
          template,
          gridRowTemplate) {

    /**
     *
     * emits:
     * - The following four drag events each have the event data { startHour: hour where the drag began, endHour: hour
     *   where the drag finished or currently is, alternate: whether the CTRL key is pressed }
     * - startDrag, updateDrag, endDrag and cancelDrag
     */
    return declare([_WidgetBase, _TemplatedMixin, Evented], {
        templateString: template,
        currentDateLabel: null,
        timeRowsContainer: null,

        model: null,

        _timeBarsByTimeEntryId: null,
        _timeEntryWatchers: null,

        _nowMark: null,
        _endOfDayMark: null,

        constructor: function() {
            this._timeBarsByTimeEntryId = {};
            this._timeEntryWatchers = {};
            this._dragMouseEventHandles = [];
            this._nowMark = domConstruct.create("div", { "class": "mark now"});
            this._endOfDayMark = domConstruct.create("div", { "class": "mark end-of-day"});
        },

        _renderDate: function() {
            var date = DateTimeUtil.convertDateStringToDateObject(this.model.get('date'));
            var label = !date ? '' : dateLocale.format(date, {selector: 'date', datePattern: 'EEEE, d MMMM'});
            this.currentDateLabel.innerHTML = label;
        },

        buildRendering: function() {
            this.inherited(arguments);
            this._renderRows();
        },

        _renderRows: function() {
            var html = "";
            for (var hour = this.model.get('startHour'); hour <= this.model.get('endHour'); hour++) {
                var label = this._getLabelForHour(hour);
                html += stringUtil.substitute(gridRowTemplate, { hourLabel: label });
            }
            this.timeRowsContainer.innerHTML = html;
        },

        _getLabelForHour: function(hour) {
            if (hour < 12) {
                return hour + ":00 am";
            } else if (hour == 12) {
                return hour + ":00 pm";
            } else {
                return (hour - 12) + ":00 pm";
            }
        },

        _getContainerForHour: function(hour) {
            return query("td", this.timeRowsContainer)[hour - this.model.get('startHour')];
        },

        _getHourForContainer: function(containerNode) {
            var hour = this.model.get('startHour');
            query("td", this.timeRowsContainer).some(function(cell) {
                if (cell === containerNode) {
                    return true;
                }
                hour++;
            });
            return hour;
        },

        postCreate: function() {
            this.own(
                this.model.watch('startHour', lang.hitch(this, "_startOrEndHourChanged")),
                this.model.watch('endHour', lang.hitch(this, "_startOrEndHourChanged")),
                this.model.watch('date', lang.hitch(this, "_renderDate")),
                this.model.watch('nowHour', lang.hitch(this, "_renderMark", this._nowMark)),
                this.model.watch('endOfDayHour', lang.hitch(this, "_renderMark", this._endOfDayMark)),
                this.model._internalStore.observe(lang.hitch(this, '_timeEntryStoreListener'), true),

                on(this.timeRowsContainer, "mousedown", lang.hitch(this, '_mouseDown')),
                on(this.timeRowsContainer, "click", lang.hitch(this, '_mouseClick'))
            );
            this._renderDate();
            this._renderMark(this._nowMark, "nowHour", null, this.model.get("nowHour"));
            this._renderMark(this._endOfDayMark, "endOfDayHour", null, this.model.get("endOfDayHour"));
        },

        _currentDrag: null,
        _dragMouseEventHandles: null,

        _mouseClick: function(e) {
            var cell = this._getContainingCell(e.target);
            if (cell) {
                var timeAtCursor = this._getTimeAtPosition(e.x, cell);
                this.emit("click", timeAtCursor);
            }
        },

        _mouseDown: function(e) {
            var cell = this._getContainingCell(e.target);
            if (cell) {
                var timeAtCursor = this._getTimeAtPosition(e.x, cell);
                this._currentDrag = {
                    startHour: timeAtCursor,
                    endHour: timeAtCursor
                };
                this._updateAlternate(this._currentDrag, e);
                this.emit("startDrag", this._currentDrag);
                this._dragMouseEventHandles.push(
                    on(this.timeRowsContainer, "mousemove", lang.hitch(this, "_mouseMove")),
                    on(document, "mouseup", lang.hitch(this, "_mouseUp"))
                );
            }
        },

        _mouseMove: function(e) {
            var cell = this._getContainingCell(e.target);
            if (cell) {
                this._currentDrag.endHour = this._getTimeAtPosition(e.x, cell);
                this._updateAlternate(this._currentDrag, e);
                this.emit("updateDrag", this._currentDrag);
            }
        },

        _mouseUp: function(e) {
            var drag = this._currentDrag;
            this._currentDrag = null;
            _.forEach(this._dragMouseEventHandles, function(handle) {
                handle.remove();
            });

            var cell = this._getContainingCell(e.target);
            if (cell) {
                drag.endHour = this._getTimeAtPosition(e.x, cell);
                this._updateAlternate(drag, e);
                this.emit("endDrag", drag);
            } else {
                this.emit("cancelDrag");
            }
        },

        _updateAlternate: function (data, event) {
            data.alternate = event.ctrlKey || event.metaKey;
            return data;
        },

        _getContainingCell: function(node) {
            while (node && node.tagName !== "TD") {
                node = node.parentNode;
            }
            // TODO and cell is within this.timeRowsContainer
            return node;
        },

        _getTimeAtPosition: function(x, cell, roundToMinutes) {
            var hour = this._getHourForContainer(cell);
            var portion = this._getPercentageAtPosition(x, cell);
            return hour + portion;
        },

        _getPercentageAtPosition: function(x, cell) {
            var box = domGeom.position(cell);
            x = x - box.x;
            return x / box.w;
        },


        _timeEntryStoreListener: function(object, removedFrom, insertedInto) {
            if (insertedInto > -1 && removedFrom > -1) {
                this._timeEntryChanged(object);
            } else if (removedFrom > -1) {
                this._timeEntryRemoved(object);
            } else if (insertedInto > -1) {
                this._timeEntryAdded(object);
            }
        },

        _calculateTimeSlotsForTimeEntry: function(timeEntry) {
            var startHour = DateTimeUtil.beginningOfHour(timeEntry.get("startHour"));
            var startPercentage = DateTimeUtil.percentageOfHour(timeEntry.get("startHour"));

            var endHour = DateTimeUtil.beginningOfHour(timeEntry.get("endHour"));
            var endPercentage = DateTimeUtil.percentageOfHour(timeEntry.get("endHour"));
            if (endPercentage === 0) {
                endHour--;
                endPercentage = 100;
            }

            var slots = [];
            for (var hour = startHour; hour <= endHour; hour++) {
                var first = (hour === startHour);
                var last = (hour === endHour);
                slots.push({
                    hour: hour,
                    startPercentage: first ? startPercentage : 0,
                    endPercentage: last ? endPercentage : 100,
                    isStart: first,
                    isEnd: last
                });
            }
            return slots;
        },

        _timeEntryAdded: function(timeEntry) {
            this._buildTimeBarsForTimeEntry(timeEntry);
        },

        _timeEntryChanged: function(timeEntry) {
            this._adjustTimeBars(timeEntry);
            _.forEach(this._timeBarsByTimeEntryId[timeEntry.get("id")], function(timeBar) {
                this._setTimeBarAttributes(timeBar, timeEntry);
            }, this);
        },

        _adjustTimeBars: function(timeEntry) {
            var timeBars = this._timeBarsByTimeEntryId[timeEntry.get("id")];
            var firstTimeBarHour = this._getHourForContainer(timeBars[0].parentNode);
            var lastTimeBarHour = firstTimeBarHour + timeBars.length - 1;

            var slots = this._calculateTimeSlotsForTimeEntry(timeEntry);
            var startHour = slots[0].hour;
            var endHour = startHour + slots.length - 1;

            for (firstTimeBarHour; firstTimeBarHour < startHour; firstTimeBarHour++) {
                domConstruct.destroy(timeBars.shift());
            }
            for (lastTimeBarHour; lastTimeBarHour > endHour; lastTimeBarHour--) {
                domConstruct.destroy(timeBars.pop());
            }

            var i = 0;
            for (var hour = startHour; hour <= endHour; hour++) {
                if (hour < firstTimeBarHour || hour > lastTimeBarHour) {
                    var timeBar = this._createTimeBar(timeEntry, slots[i]);
                    timeBars.splice(hour - startHour, 0, timeBar);
                    this._placeTimeBar(timeBar, hour);
                } else {
                    this._setTimeBarSize(timeBars[hour - startHour], slots[i]);
                }
                i++;
            }
            this._setTextOnTimeBars(timeBars, timeEntry.code);
        },

        _buildTimeBarsForTimeEntry: function(timeEntry) {
            var timeBars = this._timeBarsByTimeEntryId[timeEntry.get("id")] = [];
            _.forEach(this._calculateTimeSlotsForTimeEntry(timeEntry), function(slot) {
                var timebar = this._createTimeBar(timeEntry, slot);
                timeBars.push(timebar);
                this._placeTimeBar(timebar, slot.hour);
            }, this);
            this._setTextOnTimeBars(timeBars, timeEntry.code);
        },

        _placeTimeBar: function(timebar, hour) {
            domConstruct.place(timebar, this._getContainerForHour(hour));
        },

        _createTimeBar: function(timeEntry, slot) {
            var timeBar = domConstruct.create("div", {"class": "time-bar"});
            if (timeEntry) {
                this._setTimeBarAttributes(timeBar, timeEntry);
            }
            if (slot) {
                this._setTimeBarSize(timeBar, slot);
            }
            return timeBar;
        },

        _setTimeBarAttributes: function(timeBar, timeEntry) {
            var color = timeEntry.get("color");
            var light = Colors.light(color);
            var lighter = Colors.lighter(color);
            var shadow = Colors.shadow(color);
            var darker = Colors.darker(color);
            domStyle.set(timeBar, "background-color", Colors.base(color));
            domStyle.set(timeBar, "background", "linear-gradient(to bottom right, " + light + ", " + shadow + ")");
            domStyle.set(timeBar, "border-top-color", lighter);
            domStyle.set(timeBar, "border-left-color", lighter);
            domStyle.set(timeBar, "border-bottom-color", darker);
            domStyle.set(timeBar, "border-right-color", darker);
            domClass.toggle(timeBar, "selected", timeEntry.selected);
        },

        _setTimeBarSize: function(timeBar, slot) {
            domStyle.set(timeBar, "left", slot.startPercentage + "%");
            domStyle.set(timeBar, "right", (100 - slot.endPercentage) + "%");
            domClass.toggle(timeBar, "start", slot.isStart);
            domClass.toggle(timeBar, "end", slot.isEnd);
        },

        _setTextOnTimeBars: function(timeBars, text) {
            if (!timeBars || timeBars.length == 0) {
                return;
            }
            text = text || "";
            var middle;
            if (timeBars.length % 2 == 0) {
                // even
                middle = timeBars.length / 2 - 1;
                if (timeBars[middle + 1].clientWidth > timeBars[middle].clientWidth + 3) {
                    middle = middle + 1;
                }
            } else {
                // odd
                middle = (timeBars.length - 1) / 2;
            }

            _.forEach(timeBars, function(bar, i) {
                bar.innerText = (middle === i) ? text : "";
            });
        },

        _timeEntryRemoved: function(timeEntry) {
            var timeBars = this._timeBarsByTimeEntryId[timeEntry.get("id")];
            _.forEach(timeBars, function(timeBar) {
                domConstruct.destroy(timeBar);
            });
            delete this._timeBarsByTimeEntryId[timeEntry.get("id")];
        },

        _startOrEndHourChanged: function(property, prev, value) {
            if (prev !== value) {
                this._renderRows();
            }
        },

        _renderMark: function(markNode, property, prev, time) {
            var hour = DateTimeUtil.beginningOfHour(time);
            var container = this._getContainerForHour(hour);
            if (container) {
                var fraction = DateTimeUtil.fractionOfHour(time);
                markNode.style.left = (fraction * 100).toFixed(1) + "%";

                var adjustment = -Math.round(fraction / .5);
                markNode.style.marginLeft = adjustment + "px";

                domConstruct.place(markNode, container);
            } else {
                if (markNode.parentNode) {
                    markNode.parentNode.removeChild(markNode);
                }
            }
        }
    });
});