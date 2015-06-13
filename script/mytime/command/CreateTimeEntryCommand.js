/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define(["./_Command"],
function (_Command) {
    return _Command.makeCommand({
        commandTopic: "time-entry/create",
        timeEntry: null
    });
});