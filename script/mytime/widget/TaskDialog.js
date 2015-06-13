define([
    'dojo/_base/lang', 'dojo/_base/declare', 'dojo/Deferred',
    'dijit/Dialog',
    'mytime/widget/TaskForm'
], function(lang, declare, Deferred, Dialog, TaskForm) {
    return declare([Dialog], {

        form: null,

        _formDeferred: null,

        /**
         * Show the dialog and return a promise that will be resolved when the user clicks OK or rejected when the user
         * clicks Cancel.
         * @param value
         * @returns {Deferred.promise|*|dojo.Deferred.promise}
         */
        showAndWaitForUser: function(value) {
            if (value) {
                this.set('value', value);
            }
            this.show();
            this._formDeferred = new Deferred();

            return this._formDeferred.promise;
        },

        constructor: function() {
            this.form = new TaskForm();
        },

        postCreate: function() {
            this.inherited(arguments);
            this.set('content', this.form);
            this.form.on('submit', lang.hitch(this, '_submit'));
            this.form.on('cancel', lang.hitch(this, '_cancel'));
        },

        _setValueAttr: function(value) {
            this.set('title', 'Task ' + value.code);
            this.form.set('value', value);
        },

        _getValueAttr: function() {
            return this.form.get('value');
        },

        _submit: function(value) {
            if (this._formDeferred) {
                this._formDeferred.resolve(value);
                this._formDeferred = null;
            }
            // NOTE: hide is not needed because the Dialog code seems to handle it automatically.
        },

        _cancel: function() {
            this.hide();
        },

        onHide: function() {
            if (this._formDeferred) {
                this._formDeferred.reject('Canceled');
                this._formDeferred = null;
            }
        }
    });
});