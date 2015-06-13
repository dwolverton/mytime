define([
    'lodash',
    'dojo/_base/lang', 'dojo/_base/declare',
    'dijit/_WidgetBase', 'dijit/_TemplatedMixin', 'dijit/_WidgetsInTemplateMixin',
    'mytime/model/Task',
    'dojo/text!./TaskForm/TaskFormContent.html',
    /* widgets in template */
    'dijit/form/Form', 'dijit/form/TextBox', 'dijit/form/Button'
], function (
    _,
    lang, declare,
    _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
    Task,
    TaskFormContent) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

        baseClass: 'task-form',

        templateString: TaskFormContent,

        /**
         * Attach Point
         */
        form: null,

        value: null,

        _setValueAttr: function(value) {
            this.value = value;
            this.form.set('value', value);
        },

        _getValueAttr: function() {
            var props = lang.mixin({}, this.value, this.form.get('value'));
            return new Task(props);
        },

        postCreate: function() {
            this.form.onSubmit = lang.hitch(this, function() {
                this.emit('submit', this.get('value'));
                return false;
            });
        },

        cancel: function() {
            this.emit('cancel');
        }
    });
});