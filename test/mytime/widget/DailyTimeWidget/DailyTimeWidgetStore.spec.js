/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "mytime/widget/DailyTimeWidget/DailyTimeWidgetStore",
    "mytime/model/TimeEntry",
    "dojo/store/Memory", "dojo/store/Observable"
], function(
    DailyTimeWidgetStore,
    TimeEntry,
    MemoryStore, Observable
) {
    describe("mytime/widget/DailyTimeWidget/DailyTimeWidgetStore", function() {

        var store, sourceStore;
        var taskStore = new MemoryStore();

        function initSourceStore() {
            sourceStore = new Observable(new MemoryStore());
        }

        function initStore(widgetParams) {
            widgetParams = widgetParams || {date: "2010-10-10", startHour: 10, endHour: 15, sourceStore: sourceStore,
                taskStore: taskStore};
            store = new DailyTimeWidgetStore(widgetParams);
        }

        function setupStandardStore() {
            initSourceStore();
            initStore();
        }

        function createTimeEntry(id, date, startHour, endHour, taskId) {
            return new TimeEntry({
                id: id,
                date: date,
                startHour: startHour,
                endHour: endHour,
                taskId: taskId
            });
        }

        function addToSource(timeEntry) {
            if (typeof timeEntry === "string") {
                timeEntry = createTimeEntry.apply(this, arguments);
            }
            sourceStore.put(timeEntry);
        }

        function removeFromSource(timeEntry) {
            if (typeof timeEntry === "string") {
                timeEntry = createTimeEntry.apply(this, arguments);
            }
            sourceStore.remove(timeEntry.id);
        }

        function updateInSource(id, date, startHour, endHour, taskId) {
            var timeEntry = sourceStore.get(id);
            if (date != null) timeEntry.set("date", date);
            if (startHour != null) timeEntry.set("startHour", startHour);
            if (endHour != null) timeEntry.set("endHour", endHour);
            if (taskId != null) timeEntry.set("taskId", taskId);
            sourceStore.put(timeEntry);
        }

        function expectData() {
            expect(store.query()).to.have.length(arguments.length);

            for(var i = 0; i < arguments.length; i++) {
                var arg = arguments[i];
                arg = {
                    id: arg[0],
                    startHour: arg[1],
                    endHour: arg[2],
                    taskId: arg[3] || null
                };

                var actual = store.get(arg.id);
                expect(actual).to.be.ok;
                if (actual) {
                    expect(actual.startHour).to.equal(arg.startHour);
                    expect(actual.endHour).to.equal(arg.endHour);
                    expect(actual.taskId).to.equal(arg.taskId);
                }
            }
        }

        it("starts out empty", function() {
            setupStandardStore();
            expectData();
        });

        it("displays an entry in the middle", function() {
            setupStandardStore();
            addToSource(createTimeEntry("a", "2010-10-10", 12, 14));
            expectData(["a", 12, 14]);
        });

        it("displays an entry at the beginning and end", function() {
            setupStandardStore();
            addToSource(createTimeEntry("a", "2010-10-10", 10, 12.5));
            addToSource(createTimeEntry("b", "2010-10-10", 13.25, 16));
            expectData(["a", 10, 12.5],
                ["b", 13.25, 16]);
        });

        it("clips overflowing entries within bounds", function() {
            setupStandardStore();
            addToSource(createTimeEntry("a", "2010-10-10", 9, 12.5));
            addToSource(createTimeEntry("b", "2010-10-10", 13.25, 16.25));
            expectData(["a", 10, 12.5],
                ["b", 13.25, 16]);
        });

        it("ignores items outside of bounds", function() {
            setupStandardStore();
            addToSource(createTimeEntry("a", "2010-10-10", 2, 8));
            addToSource(createTimeEntry("b", "2010-10-10", 8, 10));
            addToSource(createTimeEntry("c", "2010-10-10", 16, 18));
            addToSource(createTimeEntry("d", "2010-10-10", 18, 24));
            expectData();
        });

        it("ignores items with wrong date", function() {
            setupStandardStore();
            addToSource(createTimeEntry("a", "2010-10-9", 10, 12.5));
            addToSource(createTimeEntry("b", "2010-10-11", 12, 13));
            addToSource(createTimeEntry("c", "2014-10-10", 13.25, 17));
            expectData();
        });

        it("removes items", function() {
            setupStandardStore();
            addToSource("beginning", "2010-10-10", 10, 12.5);
            addToSource("middle", "2010-10-10", 12, 13);
            addToSource("end", "2010-10-10", 13.25, 17);
            addToSource("remains", "2010-10-10", 13, 14);

            removeFromSource("beginning", "2010-10-10", 10, 12.5);
            removeFromSource("middle", "2010-10-10", 12, 13);
            removeFromSource("end", "2010-10-10", 13.25, 17);
            expectData(["remains", 13, 14]);
        });

        it("modifies a moved entry", function() {
            setupStandardStore();
            addToSource("a", "2010-10-10", 10, 12.5);
            updateInSource("a", null, 11);
            expectData(["a", 11, 12.5]);
            updateInSource("a", null, null, 11.5);
            expectData(["a", 11, 11.5]);
        });

        it("modifies a moved entry and constrains to bounds", function() {
            setupStandardStore();
            addToSource("a", "2010-10-10", 10, 12.5);
            updateInSource("a", null, 3);
            expectData(["a", 10, 12.5]);
            updateInSource("a", null, null, 20);
            expectData(["a", 10, 16]);
        });

        it("adds item when moves into range", function() {
            setupStandardStore();
            addToSource("wrong-hour", "2010-10-10", 2, 3);
            addToSource("wrong-day", "2010-10-9", 10, 12.5);

            updateInSource("wrong-hour", null, 11, 14);
            updateInSource("wrong-day", "2010-10-10");

            expectData(["wrong-hour", 11, 14],
                ["wrong-day", 10, 12.5]);
        });

        it("removes item when moves out of range", function() {
            setupStandardStore();
            addToSource("wrong-hour", "2010-10-10", 12, 33);
            addToSource("wrong-day", "2010-10-10", 10, 12.5);

            updateInSource("wrong-hour", null, 3, 4);
            updateInSource("wrong-day", "2010-10-11");

            expectData();
        });

        it("loads entries from a store initially", function() {
            initSourceStore();
            addToSource("a", "2010-10-9", 8, 12);
            addToSource("b", "2010-10-10", 9, 12);
            addToSource("c", "2010-10-10", 12.5, 15);
            addToSource("d", "2010-10-10", 15, 17);
            addToSource("e", "2010-10-11", 12, 14);
            initStore();

            expectData(["b", 10, 12],
                ["c", 12.5, 15],
                ["d", 15, 16]);
        });

        it("can have source store set before date", function() {
            initSourceStore();
            addToSource("a", "2010-10-9", 8, 12);
            addToSource("b", "2010-10-10", 9, 12);
            addToSource("c", "2010-10-10", 12.5, 15);
            addToSource("d", "2010-10-10", 15, 17);
            addToSource("e", "2010-10-11", 12, 14);
            initStore({startHour: 10, endHour: 15});

            store.set("sourceStore", sourceStore);
            expectData();

            store.set("date", "2010-10-10");
            expectData(["b", 10, 12],
                ["c", 12.5, 15],
                ["d", 15, 16]);
        });

        it("can have date set before source store", function() {
            initSourceStore();
            addToSource("a", "2010-10-9", 8, 12);
            addToSource("b", "2010-10-10", 9, 12);
            addToSource("c", "2010-10-10", 12.5, 15);
            addToSource("d", "2010-10-10", 15, 17);
            addToSource("e", "2010-10-11", 12, 14);
            initStore({startHour: 10, endHour: 15});

            store.set("date", "2010-10-10");
            expectData();

            store.set("sourceStore", sourceStore);
            expectData(["b", 10, 12],
                ["c", 12.5, 15],
                ["d", 15, 16]);
        });

        it("can unset date", function() {
            setupStandardStore();
            addToSource("a", "2010-10-10", 10, 12);

            store.set("date", null);

            addToSource("b", "2010-10-10", 12, 14);

            expectData();
        });

        it("preserves taskId", function() {
            setupStandardStore();
            addToSource("a", "2010-10-10", 9, 12, "red");
            addToSource("b", "2010-10-10", 12, 14, "green");
            addToSource("c", "2010-10-10", 14, 17, "blue");

            expectData(["a", 10, 12, "red"],
                       ["b", 12, 14, "green"],
                       ["c", 14, 16, "blue"]);
        });

        it("updates with changes to startHour", function() {
            initSourceStore();
            addToSource("a", "2010-10-10", 9, 12);
            addToSource("b", "2010-10-10", 12.5, 15);
            addToSource("c", "2010-10-10", 15, 17);
            initStore();

            store.set("startHour", 13);
            expectData(["b", 13, 15],
                       ["c", 15, 16]);
        });

        it("updates with changes to endHour", function() {
            initSourceStore();
            addToSource("a", "2010-10-10", 9, 12);
            addToSource("b", "2010-10-10", 12.5, 15);
            addToSource("c", "2010-10-10", 15, 17);
            initStore();

            store.set("endHour", 12);
            expectData(["a", 10, 12],
                       ["b", 12.5, 13]);
        });

        it("gets code and color from task", function() {
            initSourceStore();
            addToSource("a", "2010-10-10", 12, 15, "task-2");
            taskStore.add({id: "task-1", code: "CODE1", color: "red"});
            taskStore.add({id: "task-2", code: "CODE2", color: "yellow"});
            initStore();

            var result = store.get("a");
            expect(result).to.have.property("taskId", "task-2");
            expect(result).to.have.property("code", "CODE2");
            expect(result).to.have.property("color", "yellow");
        });
    });
});