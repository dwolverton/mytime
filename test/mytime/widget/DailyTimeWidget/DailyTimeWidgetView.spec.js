/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "dojo/query", "dojo/dom-class", "dojo/dom-style", "dojo/Stateful",
    "mytime/model/TimeEntry", "mytime/util/store/EnhancedMemoryStore",
    "mytime/widget/DailyTimeWidget/DailyTimeWidgetView",
], function(
    query, domClass, domStyle, Stateful,
    TimeEntry, EnhancedMemoryStore,
    View
) {

    describe("mytime/DailyTimeWidget/DailyTimeWidgetView", function() {

        var view;
        var model;

        function createBasicView() {
            model = new Stateful({startHour: 8, endHour: 14, _internalStore: EnhancedMemoryStore.createObservable()});
            view = new View({model: model});
        }

        function addTimeEntry(id, startHour, endHour, color) {
            if (!color) {
                color = "blue";
            }
            model._internalStore.put(new TimeEntry({
                id: id,
                startHour: startHour,
                endHour: endHour,
                color: color
            }));
        }

        function changeTimeEntry(id, startHour, endHour, color) {
            var timeEntry = model._internalStore.get(id);
            if (startHour != null) {
                timeEntry.set("startHour", startHour);
            }
            if (endHour != null) {
                timeEntry.set("endHour", endHour);
            }
            if (color != null) {
                timeEntry.set("color", color);
            }
            model._internalStore.put(timeEntry);
        }

        function removeTimeEntry(id) {
            model._internalStore.remove(id);
        }

        function getBars(expectedNumberOfBars) {
            var bars = query(".time-bar", view.domNode);
            expect(bars.length).to.equal(expectedNumberOfBars);
            return bars.length == 1 ? bars[0] : bars;
        }

        function getBar() {
            return getBars(1);
        }

        function expectClasses(domNode, classes) {
            var actual = domNode.className.split(/\s+/).sort().join(" ");
            var expected = classes.split(/\s+/).sort().join(" ");
            expect(actual).to.equal(expected);
        }

        function expectPosition(bar, row, leftPercent, rightPercent, isStart, isEnd) {
            expect(bar.parentNode.cellIndex).to.equal(1);
            expect(bar.parentNode.parentNode.rowIndex).to.equal(row);
            leftPercent = leftPercent + "%";
            rightPercent = rightPercent + "%";
            expect(bar.style.left).to.equal(leftPercent);
            expect(bar.style.right).to.equal(rightPercent);
            expect(domClass.contains(bar, "start")).to.equal(isStart);
            expect(domClass.contains(bar, "end")).to.equal(isEnd);
        }

        it("starts out empty", function() {
            createBasicView();
            var table = query("table", view.domNode)[0];
            expect(table.rows.length).to.equal(8);
            expect(table.rows[1].cells.length).to.equal(2);
            expect(query(".time-bar").length).to.equal(0);
        });

        it("renders a time bar that spans exactly one hour", function() {
            createBasicView();
            addTimeEntry("a", 9, 10, "blue");
            var bar = getBar();
            expectPosition(bar, 2, 0, 0, true, true);
        });

        it("renders a time bar that spans first half hour", function() {
            createBasicView();
            addTimeEntry("a", 9, 9.5, "blue");
            var bar = getBar();
            expectPosition(bar, 2, 0, 50, true, true);
        });

        it("renders a time bar that spans middle half hour", function() {
            createBasicView();
            addTimeEntry("a", 9.25, 9.75, "blue");
            var bar = getBar();
            expectPosition(bar, 2, 25, 25, true, true);
        });

        it("renders a two hour chunk", function() {
            createBasicView();
            addTimeEntry("a", 8, 10, "blue");
            var bars = getBars(2);
            expectPosition(bars[0], 1, 0, 0, true, false);
            expectPosition(bars[1], 2, 0, 0, false, true);
        });

        it("renders a three hour chunk", function() {
            createBasicView();
            addTimeEntry("a", 8, 11, "blue");
            var bars = getBars(3);
            expectPosition(bars[0], 1, 0, 0, true, false);
            expectPosition(bars[1], 2, 0, 0, false, false);
            expectPosition(bars[2], 3, 0, 0, false, true);
        });

        it("renders a chunk, straddling three hours", function() {
            createBasicView();
            addTimeEntry("a", 8.75, 10.25, "blue");
            var bars = getBars(3);
            expectPosition(bars[0], 1, 75, 0, true, false);
            expectPosition(bars[1], 2, 0, 0, false, false);
            expectPosition(bars[2], 3, 0, 75, false, true);
        });

        it("changes start time within hour", function() {
            createBasicView();
            addTimeEntry("a", 9, 10, "blue");

            changeTimeEntry("a", 9.25);
            expectPosition(getBar(), 2, 25, 0, true, true);

            changeTimeEntry("a", 9);
            expectPosition(getBar(), 2, 0, 0, true, true);
        });

        it("changes end time within hour", function() {
            createBasicView();
            addTimeEntry("a", 9, 10, "blue");

            changeTimeEntry("a", null, 9.5);
            expectPosition(getBar(), 2, 0, 50, true, true);

            changeTimeEntry("a", null, 9.75);
            expectPosition(getBar(), 2, 0, 25, true, true);
        });

        it("adds hours to end", function() {
            createBasicView();
            addTimeEntry("a", 9, 10, "blue");

            changeTimeEntry("a", null, 10.5);
            var bars = getBars(2)
            expectPosition(bars[0], 2, 0, 0, true, false);
            expectPosition(bars[1], 3, 0, 50, false, true);

            changeTimeEntry("a", null, 12);
            var bars = getBars(3);
            expectPosition(bars[0], 2, 0, 0, true, false);
            expectPosition(bars[1], 3, 0, 0, false, false);
            expectPosition(bars[2], 4, 0, 0, false, true);
        });

        it("adds hours to beginning", function() {
            createBasicView();
            addTimeEntry("a", 10, 10.5, "blue");

            changeTimeEntry("a", 9);
            var bars = getBars(2);
            expectPosition(bars[0], 2, 0, 0, true, false);
            expectPosition(bars[1], 3, 0, 50, false, true);

            changeTimeEntry("a", 8.75);
            var bars = getBars(3);
            expectPosition(bars[0], 1, 75, 0, true, false);
            expectPosition(bars[1], 2, 0, 0, false, false);
            expectPosition(bars[2], 3, 0, 50, false, true);
        });

        it("remove hours from end", function() {
            createBasicView();
            addTimeEntry("a", 9, 12, "blue");

            changeTimeEntry("a", null, 10.5);
            var bars = getBars(2);
            expectPosition(bars[0], 2, 0, 0, true, false);
            expectPosition(bars[1], 3, 0, 50, false, true);

            changeTimeEntry("a", null, 10);
            expectPosition(getBar(), 2, 0, 0, true, true);
        });

        it("remove hours from beginning", function() {
            createBasicView();
            addTimeEntry("a", 8.75, 10.5, "blue");

            changeTimeEntry("a", 9);
            var bars = getBars(2);
            expectPosition(bars[0], 2, 0, 0, true, false);
            expectPosition(bars[1], 3, 0, 50, false, true);

            changeTimeEntry("a", 10.25);
            expectPosition(getBar(), 3, 25, 50, true, true);
        });

        it("moves down to a new hour", function() {
            createBasicView();
            addTimeEntry("a", 9.0, 10.0, "blue");
            changeTimeEntry("a", 10.0, 11.0);
            expectPosition(getBar(), 3, 0, 0, true, true);
        });

        // TODO remove time entry
        // TODO emit events

    });

});