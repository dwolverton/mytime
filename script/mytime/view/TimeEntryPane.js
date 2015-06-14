/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "lodash", "dojo/_base/lang", "dojo/_base/declare",
    'dijit/_WidgetBase', 'dijit/_TemplatedMixin', 'dijit/_WidgetsInTemplateMixin',
    'mytime/util/DateTimeUtil', 'mytime/model/modelRegistry',
    "mytime/command/CreateTimeEntryCommand", 'mytime/command/UpdateTimeEntryCommand',
    'mytime/command/DeleteTimeEntryCommand',
    'mytime/util/syncFrom',
    'dojox/mvc/sync',
    'dojo/text!./TimeEntryPane.html',
    /* In template: */
    'mytime/widget/DaysInWeekList', 'mytime/widget/DailyTimeWidget', "mytimewidget/TimeEntryDetails"
], function (
    _, lang, declare,
    _WidgetBase,
    _TemplatedMixin, _WidgetsInTemplateMixin,
    DateTimeUtil, modelRegistry,
    CreateTimeEntryCommand, UpdateTimeEntryCommand, DeleteTimeEntryCommand,
    syncFrom,
    sync,
    template
) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        baseClass: 'time-entry-pane',
        _daysInWeekList: null,
        _dailyTimeWidget: null,
        _timeEntryDetails: null,

        currentDate: DateTimeUtil.getCurrentDate(),

        postCreate: function() {
            this.own(sync(this, 'currentDate', this._daysInWeekList, 'selectedDate'));
            this.own(sync(this, 'currentDate', this._dailyTimeWidget, 'date'));
            this.own(syncFrom(this._dailyTimeWidget, 'selectedId', this._timeEntryDetails));


            this.own(syncFrom(modelRegistry, 'timeEntryStore', this._daysInWeekList));
            this.own(syncFrom(modelRegistry, 'timeEntryStore', this._dailyTimeWidget));
            this.own(syncFrom(modelRegistry, 'taskStore', this._dailyTimeWidget));
            this.own(syncFrom(modelRegistry, 'timeEntryStore', this._timeEntryDetails));
            this.own(syncFrom(modelRegistry, 'taskStore', this._timeEntryDetails));

            this.own(this._dailyTimeWidget.on('createTimeEntry', lang.hitch(this, '_createTimeEntry')));
            this.own(this._dailyTimeWidget.on('updateTimeEntry', lang.hitch(this, '_updateTimeEntry')));
            this.own(this._dailyTimeWidget.on('deleteTimeEntry', lang.hitch(this, '_deleteTimeEntry')));
        },

        _createTimeEntry: function(entry) {
            new CreateTimeEntryCommand({timeEntry: entry.timeEntry}).exec()
                .then(lang.hitch(this, function(result) {
                    _.defer(lang.hitch(this, function() {
                        // When an entry is added start editing it.
                        this._dailyTimeWidget.set("selectedId", result.timeEntryId);
                    }));
                }));
        },

        _updateTimeEntry: function(entry) {
            new UpdateTimeEntryCommand({timeEntry: entry.timeEntry}).exec();
        },

        _deleteTimeEntry: function(entry) {
            new DeleteTimeEntryCommand({timeEntryId: entry.timeEntryId}).exec();
        }
    });
});