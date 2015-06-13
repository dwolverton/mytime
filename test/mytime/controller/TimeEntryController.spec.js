/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "mytime/controller/TimeEntryController", "mytime/model/modelRegistry", "mytime/util/store/EnhancedMemoryStore",
    "mytime/command/CreateTimeEntryCommand", "mytime/command/UpdateTimeEntryCommand",
    "mytime/command/DeleteTimeEntryCommand",
    "mytime/model/TimeEntry"

], function(
    TimeEntryController, modelRegistry, EnhancedMemoryStore,
    CreateTimeEntryCommand, UpdateTimeEntryCommand, DeleteTimeEntryCommand,
    TimeEntry
) {

    describe("mytime/controller/TimeEntryController", function () {

        var controller;
        var store;

        before(function() {
            store = EnhancedMemoryStore.createObservable()
            modelRegistry.set("timeEntryStore", store);
            controller = new TimeEntryController();
        });

        afterEach(function() {
            store.clear();
        });

        after(function() {
            controller.destroy();
            modelRegistry.set("timeEntryStore", null);
        });

        it("creates", function() {
            var id;
            new CreateTimeEntryCommand({timeEntry: {
                date: "2014-05-26",
                startHour: 12,
                endHour: 20
            }}).exec().then(function(result) {
                    id = result.timeEntryId;
                    expect(id).to.be.a('string');
                    expect(result.timeEntry).to.have.property("id", id);
                    expect(result.timeEntry).to.have.property("date", "2014-05-26");
                });

            var result = store.query({date: "2014-05-26"})
            expect(result).to.have.length(1);
            result = result[0];
            expect(result).to.be.an.instanceof(TimeEntry);
            expect(result).to.have.property("id", id);
            expect(result).to.have.property("startHour", 12);
            expect(result).to.have.property("endHour", 20);
        });

        it("updates", function() {
            var id;
            new CreateTimeEntryCommand({timeEntry: {
                date: "2014-05-26",
                startHour: 12,
                endHour: 20
            }}).exec().then(function(result) {
                id = result.timeEntryId;
            });
            new UpdateTimeEntryCommand({timeEntry: {
                id: id,
                date: "2014-05-26",
                startHour: 5,
                endHour: 9
            }}).exec().then(function(result) {
                    expect(result.timeEntryId).to.equal(id);
                    expect(result.timeEntry).to.have.property("id", id);
                    expect(result.timeEntry).to.have.property("startHour", 5);
                });

            var result = store.query({date: "2014-05-26"})
            expect(result).to.have.length(1);
            result = result[0];
            expect(result).to.be.an.instanceof(TimeEntry);
            expect(result).to.have.property("id", id);
            expect(result).to.have.property("startHour", 5);
            expect(result).to.have.property("endHour", 9);
        });

        it("deletes", function() {
            var id;
            new CreateTimeEntryCommand({timeEntry: {
                date: "2014-05-26",
                startHour: 12,
                endHour: 20
            }}).exec().then(function(result) {
                id = result.timeEntryId;
            });
            new DeleteTimeEntryCommand({timeEntryId: id}).exec().then(function(result) {
                expect(result.timeEntryId).to.equal(id);
                expect(result.timeEntry).to.have.property("id", id);
                expect(result.timeEntry).to.have.property("startHour", 12);
            });

            expect(store.size()).to.equal(0);
        });
    });
});