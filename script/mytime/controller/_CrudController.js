/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "lodash", "dojo/_base/lang", "dojo/_base/declare",
    "dijit/Destroyable",
    "mytime/persistence/IdGenerator", "mytime/persistence/LocalStorage"
], function(
    _, lang, declare,
    Destroyable,
    IdGenerator, LocalStorage
) {

    /**
     * Base class for a standard CRUD controller.
     */
    return declare([Destroyable], {

        createCommand: null,
        updateCommand: null,
        deleteCommand: null,

        store: null,
        objectTypeConstructor: null,
        objectTypeName: "",
        objectTypeStringForMessages: "",
        storageKey: "",

        commandObjectProperty: "",
        commandIdProperty: "",

        constructor: function() {
            this.own(
                this.createCommand.subscribe(lang.hitch(this, "handleCreate")),
                this.updateCommand.subscribe(lang.hitch(this, "handleUpdate")),
                this.deleteCommand.subscribe(lang.hitch(this, "handleDelete"))
            );
            this._persistStore = _.debounce(function() {
                if (this.storageKey) {
                    LocalStorage.persistStore(this.storageKey, this.store)
                }
            }, 100);
        },

        handleCreate: function(command) {
            if (!this.store) {
                command.reject(this._getCommandError("Cannot add {} before system is initialized."));
            } else {
                var object = new this.objectTypeConstructor(command[this.commandObjectProperty]);
                object.set("id", IdGenerator.nextIdForType(this.objectTypeName));

                this._beforeCreate(command, object);
                if (command.isFulfilled()) {
                    return;
                }

                console.log("PUT NEW " + JSON.stringify(object));
                this.store.put(object);
                command.resolve(this._getCommandResult(object));
                this._persistStore();
                this._afterCreate(command, object);
            }
        },

        /**
         * Override this to extend behavior. Called before creating a new object. To prevent the default behavior,
         * resolve or reject the command.
         *
         * @param {Object} command
         * @param {Object} object new object about to be created. an instance of objectTypeConstructor
         * @private
         */
        _beforeCreate: function(command, object) {},

        /**
         * Override this to extend behavior. Called after creating a new object.
         *
         * @param {Object} command
         * @param {Object} object new object created. an instance of objectTypeConstructor
         * @private
         */
        _afterCreate: function(command, object) {},

        handleUpdate: function(command) {
            if (!this.store) {
                command.reject(this._getCommandError("Cannot update {} before system is initialized."));
            } else {
                var updateObject = command[this.commandObjectProperty];
                var id = updateObject.id;
                var existingObject = this.store.get(id);
                if (!existingObject) {
                    command.reject(this._getCommandError("Cannot update {}. It does not exist."));
                    return;
                }

                this._beforeUpdate(command, existingObject);
                if (command.isFulfilled()) {
                    return;
                }

                existingObject.updateFrom(updateObject);
                console.log("PUT " + JSON.stringify(existingObject));
                this.store.put(existingObject);
                command.resolve(this._getCommandResult(existingObject));
                this._persistStore();
                this._afterUpdate(command, existingObject);
            }
        },

        /**
         * Override this to extend behavior. Called before updating an object. To prevent the default behavior, resolve
         * or reject the command.
         *
         * @param command
         * @param existingObject the object from the store before updates are applied
         * @private
         */
        _beforeUpdate: function(command, existingObject) {},

        /**
         * Override this to extend behavior. Called after updating an object.
         *
         * @param {Object} command
         * @param {Object} object in the store after updates made. an instance of objectTypeConstructor
         * @private
         */
        _afterUpdate: function(command, object) {},

        handleDelete: function(command) {
            if (!this.store) {
                command.reject(this._getCommandError("Cannot delete {} before system is initialized."));
            } else {
                var id = command[this.commandIdProperty];
                var existingObject = this.store.get(id);
                if (!existingObject) {
                    command.reject(this._getCommandError("Cannot delete {}. It does not exist."));
                    return;
                }

                this._beforeDelete(command, existingObject);
                if (command.isFulfilled()) {
                    return;
                }

                console.log("REMOVE " + JSON.stringify(existingObject));
                this.store.remove(id);
                command.resolve(this._getCommandResult(existingObject, id));
                this._persistStore();
                this._afterDelete(command, existingObject);
            }
        },

        /**
         * Override this to extend behavior. Called before deleting an object. To prevent the default behavior, resolve
         * or reject the command.
         *
         * @param command
         * @param existingObject the object from the store that will be deleted.
         * @private
         */
        _beforeDelete: function(command, existingObject) {},

        /**
         * Override this to extend behavior. Called after deleting an object.
         *
         * @param {Object} command
         * @param {Object} object that was removed from the store. an instance of objectTypeConstructor
         * @private
         */
        _afterDelete: function(command, existingObject) {},

        _getCommandResult: function(object, id) {
            var result = {};
            if (object) {
                id = id || object.id;
                result[this.commandObjectProperty] = object;
            }
            if (id) {
                result[this.commandIdProperty] = id;
            }
            return result;
        },

        _getCommandError: function(errorString) {
            return new Error(errorString.replace(/{}/g, this.objectTypeStringForMessages));
        }

        // TODO destroy
    });

});