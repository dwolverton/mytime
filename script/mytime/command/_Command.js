/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define(["lodash", "dojo/_base/lang", "dojo/_base/declare", "dojo/Deferred", "dojo/topic"],
function (_, lang, declare, Deferred, topic) {

    /**
     * Command instances have an exec() method.
     * Each command class has a 'static' subscribe() method.
     *
     */
    var _Command = declare([Deferred], {
        commandTopic: "",

        constructor: function(args) {
            lang.mixin(this, args);
        },

        exec: function() {
            topic.publish("command/" + this.commandTopic, this);
            return this;
        }
    });

    _Command.makeCommand = function(prototype) {
        var Command = declare([_Command], prototype);
        /**
         * Subscribe to this class of Commands, not including subclasses.
         * @param subscriberFunction function to call when the event is executed.
         */
        Command.subscribe = function(subscriberFunction) {
            return topic.subscribe("command/" + prototype.commandTopic, subscriberFunction);
        };
        return Command;
    };

    return _Command;
});