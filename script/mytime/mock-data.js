/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "mytime/command/CreateTaskCommand", "mytime/command/CreateTimeEntryCommand",
    "mytime/util/DateTimeUtil"
], function(CreateTaskCommand, CreateTimeEntryCommand,
            DateTimeUtil) {
    return function() {
        new CreateTaskCommand({ task: { code: "CAYENNE-1234", name: "Squash a Bug" } }).exec();
        new CreateTaskCommand({ task: { code: "CAYENNE-456", name: "Make it Work" } }).exec();
        new CreateTaskCommand({ task: { code: "CAYENNE-789", name: "Do Something Awesome" } }).exec();
        new CreateTaskCommand({ task: { code: "PSP-100", name: "Uh Oh..." } }).exec();

        new CreateTimeEntryCommand({ timeEntry: {
            date: DateTimeUtil.getCurrentDate(), startHour: 8.5, endHour: 9.75,
            taskId: 2, text: "It works!"
        }}).exec();
        new CreateTimeEntryCommand({ timeEntry: {
            date: DateTimeUtil.getCurrentDate(), startHour: 9.75, endHour: 10.5,
            taskId: 1, text: "Squashing Bugs"
        }}).exec();
        new CreateTimeEntryCommand({ timeEntry: {
            date: DateTimeUtil.getCurrentDate(), startHour: 10.5, endHour: 10.75,
            text: "Daily Scrum"
        }}).exec();
        new CreateTimeEntryCommand({ timeEntry: {
            date: DateTimeUtil.getCurrentDate(), startHour: 10.75, endHour: 12,
            taskId: 1, text: "Squishing Bugs... Particularly this nasty one with bright colors."
        }}).exec();
    };
});