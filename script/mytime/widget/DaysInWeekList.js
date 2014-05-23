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
        _WeekTotalNode: null,
        _WeekDiffNode: null,

        _setSelectedDateAttr: function(value) {
            this._set('selectedDate', value);
            var date = DateTimeUtil.convertDateStringToDateObject(value);
            this._selectedDayOfWeek = date.getDay();
            this._firstDayOfWeek = dojoDate.add(date, 'day', -this._selectedDayOfWeek);
            this._fillIn();
            this._updateHours();
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
            this._updateHours();
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
                this.watch('timeEntryStore', lang.hitch(this, '_updateHours'))
            )
        },

        _getDateOfNthDay: function(n) {
            return dojoDate.add(this._firstDayOfWeek, 'day', n);
        },

        _updateHours: function() {
            if (!this.timeEntryStore || !this._headerNode || !this._firstDayOfWeek) {
                return; // too early to render
            }
            when(this.timeEntryStore.query({
                "date>=": DateTimeUtil.convertDateObjectToDateString(this._firstDayOfWeek),
                "date<=": DateTimeUtil.convertDateObjectToDateString(this._getDateOfNthDay(6))
            }), lang.hitch(this, '_renderHours'));
        },

        _renderHours: function(timeEntries) {
            var total = 0;
            var dayTotal = {};
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
                this._dayHoursNodes[i].innerHTML = this._formatHours(hours);
                domClass.toggle(this._dayHoursNodes[i], "zero-time", hours === 0);
            }
            this._weekTotalNode.innerHTML = this._formatHours(total);
            domClass.toggle(this._weekTotalNode, "zero-time", total === 0);

            this._renderDifference(total);
        },

        _renderDifference: function(total) {
            var daysIntoWeek = dojoDate.difference(this._firstDayOfWeek);
            if (daysIntoWeek > 5) {
                daysIntoWeek = 5;
            }
            var diff = 0;
            if (daysIntoWeek >= 1) {
                diff = total - (daysIntoWeek * 8);
            }

            var diffString = this._formatHours(Math.abs(diff));
            var diffSign = diff < 0 ? "- " : (diff > 0 ? "+ " : "")

            this._weekDiffNode.innerHTML = diffSign + diffString;
            domClass.toggle(this._weekDiffNode, "in-the-black", diff >= 0);
            domClass.toggle(this._weekDiffNode, "in-the-red", diff < 0);
        },

        _formatHours: function(hour) {
            return number.format(hour, { places: 2}) + '<span>h</span>';
        }
    });
});