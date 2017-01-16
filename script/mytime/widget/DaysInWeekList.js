/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "dojo/_base/declare",
    "lodash",
    "dojo/_base/lang",
    "dojo/number", "dojo/on", "dojo/query", "dojo/when",
    "dojo/dom-construct", "dojo/dom-class", "dojo/dom-style", "dojo/dom-geometry",
    "dojo/Evented", "dojo/date", "dojo/date/locale",
    "dijit/_WidgetBase", "dijit/_TemplatedMixin",
    "mytime/util/DateTimeUtil",
    "dojo/text!mytime/widget/DaysInWeekList/template.html"
],
function (declare,
    _,
    lang,
    number, on, query, when,
    domConstruct, domClass, domStyle, domGeometry,
    Evented, dojoDate, dateLocale,
    _WidgetBase, _TemplatedMixin,
    DateTimeUtil,
    template) {

    /**
     *
     * emits:
     * - The following four drag events each have the event data { startHour: hour where the drag began, endHour hour
     *   where the drag finished or currently is}
     * - startDrag, updateDrag, endDrag and cancelDrag
     */
    return declare([_WidgetBase, _TemplatedMixin, Evented], {
        templateString: template,

        selectedDate: DateTimeUtil.getCurrentDate(),

        timeEntryStore: null,

        /**
         * a JavaScript Date
         */
        _firstDayOfWeek: null,
        /**
         * an integer 0 to 6
         */
        _selectedDayOfWeek: null,

        _headerNode: null,
        _containerNode: null,
        _dayRowNodes: null,
        _dayDateNodes: null,
        _dayHoursNodes: null,
        _weekTotalNode: null,
        _weekDiffNode: null,
        _prevWeekBtn: null,
        _nextWeekBtn: null,

        _queryObserveHandle: null,

        _setSelectedDateAttr: function(value) {
            this._set('selectedDate', value);
            var date = DateTimeUtil.convertDateStringToDateObject(value);
            this._selectedDayOfWeek = date.getDay();
            var oldFirstDayOfWeek = this._firstDayOfWeek;
            this._firstDayOfWeek = dojoDate.add(date, 'day', -this._selectedDayOfWeek);
            this._fillIn();
            if (!oldFirstDayOfWeek || this._firstDayOfWeek.getTime() !== oldFirstDayOfWeek.getTime()) {
                this._handleWeekChange();
            }
        },

        buildRendering: function() {
            this.inherited(arguments);
            var rows = query('tr', this._containerNode);
            this._dayRowNodes = [];
            this._dayDateNodes = [];
            this._dayHoursNodes = [];
            for (var i = 0; i < 7; i++) {
                var row = rows[i];
                this._dayRowNodes[i] = row;
                this._dayDateNodes[i] = row.cells[0];
                this._dayHoursNodes[i] = row.cells[2];
            }
            this._fillIn();
            this._handleWeekChange();
        },

        _fillIn: function() {
            if (!this._headerNode || !this._firstDayOfWeek) {
                return; // too early to render
            }

            for (var i = 0; i < 7; i++) {
                var selected = this._selectedDayOfWeek === i;
                var date = this._getDateOfNthDay(i);

                domClass.toggle(this._dayRowNodes[i], 'selected', selected);
                this._dayDateNodes[i].innerHTML = DateTimeUtil.numberToStringWithNth(date.getDate());
            }

            var headerText = this._formatDate(this._firstDayOfWeek, 'd MMM') + ' - ' +
                this._formatDate(this._getDateOfNthDay(6), 'd MMM yyyy');
            this._headerNode.innerHTML = headerText;
        },

        _formatDate: function (date, pattern) {
            return dateLocale.format(date, {selector: 'date', datePattern: pattern});
        },

        postCreate: function() {
            var _this = this;
            this.own(
                on(this._containerNode, on.selector('tr', 'click'), function() {
                    var row = this;
                    for (var i = 0; i < 7; i++) {
                        if (row === _this._dayRowNodes[i]) {
                            var dateToSelect = DateTimeUtil.convertDateObjectToDateString(_this._getDateOfNthDay(i));
                            if (dateToSelect !== _this.selectedDate) {
                                _this.set('selectedDate', dateToSelect);
                            }
                        }
                    }
                }),
                this.watch('timeEntryStore', lang.hitch(this, '_handleWeekChange')),
                on(this._nextWeekBtn, 'click', lang.hitch(this, 'addDays', 7)),
                on(this._prevWeekBtn, 'click', lang.hitch(this, 'addDays', -7))
            )
        },

        _getDateOfNthDay: function(n) {
            return dojoDate.add(this._firstDayOfWeek, 'day', n);
        },

        _handleWeekChange: function() {
            if (!this.timeEntryStore || !this._headerNode || !this._firstDayOfWeek) {
                return; // too early to render
            }
            if (this._queryObserveHandle) {
                this._queryObserveHandle.remove();
            }
            var queryResult = this._queryTimeEntriesForWeek();
            queryResult.observe(lang.hitch(this, '_requeryAndRefreshHours'), true);
            when(queryResult, lang.hitch(this, '_renderHours'));
        },

        _queryTimeEntriesForWeek: function() {
            return this.timeEntryStore.query({
                "date>=": DateTimeUtil.convertDateObjectToDateString(this._firstDayOfWeek),
                "date<=": DateTimeUtil.convertDateObjectToDateString(this._getDateOfNthDay(6))
            });
        },

        _requeryAndRefreshHours: function() {
            when(this._queryTimeEntriesForWeek(), lang.hitch(this, '_renderHours'));
        },

        _renderHours: function(timeEntries) {
            var total = 0;
            var dayTotal = {};
            var countDaysWithEntries = 0;
            for (var i = 0; i < 7; i++) {
                dayTotal[DateTimeUtil.convertDateObjectToDateString(this._getDateOfNthDay(i))] = 0;
            }

            _.forEach(timeEntries, function(timeEntry) {
                var hours = timeEntry.endHour - timeEntry.startHour;
                total += hours;
                dayTotal[timeEntry.date] += hours;
            });

            for (var i = 0; i < 7; i++) {
                var hours = dayTotal[DateTimeUtil.convertDateObjectToDateString(this._getDateOfNthDay(i))];
                this._renderHour(this._dayHoursNodes[i], hours);
                if (hours > 0) {
                    countDaysWithEntries++;
                }
            }
            this._renderHour(this._weekTotalNode, total);

            var hoursNeeded = countDaysWithEntries * 8;
            this._renderHour(this._weekDiffNode, total - hoursNeeded, true);
        },

        _renderHour: function(cell, hours, includeSign) {
            var text = this._formatHours(Math.abs(hours));
            if (includeSign) {
                if (hours < 0) {
                    text = "- " + text;
                } else if (hours > 0) {
                    text = "+ " + text;
                }
                domClass.toggle(cell, "in-the-black", hours >= 0);
                domClass.toggle(cell, "in-the-red", hours < 0);
            }

            cell.innerHTML = text;
            domClass.toggle(cell, "zero-time", hours === 0);
        },

        _formatHours: function(hour) {
            return DateTimeUtil.formatWithTwoDecimals(hour) + '<span>h</span>';
        },

        /**
         * Adjust the selectedDate by a certain number of days.
         * @param daysToAdd number of days to add + or -
         */
        addDays: function(daysToAdd) {
            var date = DateTimeUtil.convertDateStringToDateObject(this.get('selectedDate'));
            var millis = date.valueOf();
            millis += 86400000 * daysToAdd;
            date.setTime(millis);
            this.set('selectedDate', DateTimeUtil.convertDateObjectToDateString(date));
        }
    });
});