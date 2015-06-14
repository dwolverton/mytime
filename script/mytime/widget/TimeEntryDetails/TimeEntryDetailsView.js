/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "lodash", "dojo/_base/lang", "dojo/_base/declare",
    "dojo/dom-construct", "dojo/dom-class", "dojo/dom-attr", "dojo/on", "dojo/query", "dojo/Evented", "dojo/dom",
    "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin",
    "dijit/form/Textarea", "dijit/form/FilteringSelect", "dijit/focus",
    "mytime/util/syncFrom", "mytime/util/whenAllPropertiesSet",
    "mytime/widget/TaskPickerCombo",
    "dojo/text!mytime/widget/TimeEntryDetails/templates/TimeEntryDetails.html",
    /* Widgets in Template */
    "dijit/form/Form"
],
function (
    _, lang, declare,
    domConstruct, domClass, domAttr, on, query, Evented, dom,
    _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
    Textarea, FilteringSelect, focusUtil,
    syncFrom, whenAllPropertiesSet,
    TaskPickerCombo,
    template) {


    /**
     * The slide out details entry/task details pane
     *
     * @emit taskSelected {id: string, description: string}
     */
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {

        templateString: template,

        // in template
        descriptionNode: null,
        jiraKeyNode: null,

        descriptionInput: null,
        jiraKeyInput: null,

        model: null,

        _lastSetJiraKey: null,

        postCreate: function() {
            this.own(
                whenAllPropertiesSet(this, ["taskStore"], lang.hitch(this, "_initialize"))
            );
        },

        _initialize: function() {
            this.descriptionInput = new TaskPickerCombo({
                store: this.taskStore
            });
            this.descriptionInput.placeAt(this.descriptionNode);

            this.jiraKeyInput = new FilteringSelect({
                store: this.jiraStore,
                searchAttr: 'label',
                queryExpr: "${0}"
            });
            this.jiraKeyInput.placeAt(this.jiraKeyNode);

            window.tl = this.descriptionInput;
            window.jl = this.jiraKeyInput;

            this.own(
                on(this.descriptionInput, "userchange", lang.hitch(this, '_onDescriptionChange') ),
                on(this.jiraKeyInput, "change", lang.hitch(this, "_onJiraKeyChange")),
                this.model.watch('task', lang.hitch(this, "_incomingTaskChange"))
            );

            syncFrom(this.model, "jiraKey", this.jiraKeyInput, "value");

        },

        show: function() {
            domClass.toggle(this.domNode, 'open', true);
        },

        hide: function() {
            domClass.toggle(this.domNode, 'open', false);
        },

        _onDescriptionChange: function(task) {
            on.emit(this, "taskSelected", task);
        },

        _onJiraKeyChange: function() {
            var jiraKey = this.jiraKeyInput.get('value');
            jiraKey = jiraKey || null;
            if (jiraKey !== this.model.get('jiraKey')) {
                on.emit(this, "jiraSelected", jiraKey);
            }
        },

        _incomingTaskChange: function(prop, prevValue, value) {
            this.descriptionInput.set('task', value);
        }

    });
});