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
                var entry = new this.objectTypeConstructor(command[this.commandObjectProperty]);
                entry.set("id", IdGenerator.nextIdForType(this.objectTypeName));

                this._beforeCreate(command, entry);
                if (command.isFulfilled()) {
                    return;
                }

                console.log("PUT NEW " + JSON.stringify(entry));
                this.store.put(entry);
                command.resolve(this._getCommandResult(entry));
                this._persistStore();
            }
        },

        /**
         * Override this to extend behavior. Called before creating a new object. To prevent the default behavior,
         * resolve or reject the command.
         *
         * @param {Object} command
         * @param {Object} entry new object about to be created. an instance of objectTypeConstructor
         * @private
         */
        _beforeCreate: function(command, entry) {},

        handleUpdate: function(command) {
            if (!this.store) {
                command.reject(this._getCommandError("Cannot update {} before system is initialized."));
            } else {
                var updateObject = command[this.commandObjectProperty];
                var id = updateObject.id;
                var existingEntry = this.store.get(id);
                if (!existingEntry) {
                    command.reject(this._getCommandError("Cannot update {}. It does not exist."));
                    return;
                }

                this._beforeUpdate(command, existingEntry);
                if (command.isFulfilled()) {
                    return;
                }

                existingEntry.updateFrom(updateObject);
                console.log("PUT " + JSON.stringify(existingEntry));
                this.store.put(existingEntry);
                command.resolve(this._getCommandResult(existingEntry));
                this._persistStore();
            }
        },

        /**
         * Override this to extend behavior. Called before updating an object. To prevent the default behavior, resolve
         * or reject the command.
         *
         * @param command
         * @param existingEntry the entry from the store before updates are applied
         * @private
         */
        _beforeUpdate: function(command, existingEntry) {},

        handleDelete: function(command) {
            if (!this.store) {
                command.reject(this._getCommandError("Cannot delete {} before system is initialized."));
            } else {
                var id = command[this.commandIdProperty];
                var existingEntry = this.store.get(id);
                if (!existingEntry) {
                    command.reject(this._getCommandError("Cannot delete {}. It does not exist."));
                    return;
                }

                this._beforeDelete(command, existingEntry);
                if (command.isFulfilled()) {
                    return;
                }

                console.log("REMOVE " + JSON.stringify(existingEntry));
                this.store.remove(id);
                command.resolve(this._getCommandResult(existingEntry, id));
                this._persistStore();
            }
        },

        /**
         * Override this to extend behavior. Called before deleting an object. To prevent the default behavior, resolve
         * or reject the command.
         *
         * @param command
         * @param existingEntry the entry from the store that will be deleted.
         * @private
         */
        _beforeDelete: function(command, existingEntry) {},

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