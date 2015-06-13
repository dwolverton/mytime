/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "dojo/store/Memory", "dojo/store/Observable",
    "mytime/util/store/delegateObserve"
], function(
    Memory, Observable,
    delegateObserve
) {

    describe("mytime/util/store/delegateObserve", function() {

        var store;
        var insertSpy, removeSpy, updateSpy;
        beforeEach(function() {
            store = new Observable(new Memory());
            store.add({id: "a", sort: 10});
            store.add({id: "b", sort: 20});
            store.add({id: "c", sort: 30});
            insertSpy = sinon.spy();
            removeSpy = sinon.spy();
            updateSpy = sinon.spy();
        });

        function observe(thisObject) {
            store.query({}, {sort: [{attribute: "sort"}]}).observe(
                delegateObserve(insertSpy, removeSpy, updateSpy, thisObject), true);
        }

        it("delegates insert", function() {
            observe();
            store.add({id: "foo", sort: 15});
            expect(insertSpy).to.be.calledWith({id: "foo", sort: 15}, 1);
            expect(removeSpy).not.to.be.called;
            expect(updateSpy).not.to.be.called;
        });

        it("delegates remove", function() {
            observe();
            store.remove("b");
            expect(insertSpy).not.to.be.called;
            expect(removeSpy).to.be.calledWith({id: "b", sort: 20}, 1);
            expect(updateSpy).not.to.be.called;
        });

        it("delegates update", function() {
            observe();
            store.put({id: "b", sort: 40});
            expect(insertSpy).not.to.be.called;
            expect(removeSpy).not.to.be.called;
            expect(updateSpy).to.be.calledWith({id: "b", sort: 40}, 1, 2);

        });

        it("calls delegates with this object", function() {
            var thisObj = {};
            observe(thisObj);
            store.add({id: "foo", sort: 15});
            store.put({id: "b", sort: 40});
            store.remove("b");
            expect(insertSpy).to.be.calledOn(thisObj);
            expect(insertSpy).to.be.calledWith({id: "foo", sort: 15}, 1);
            expect(updateSpy).to.be.calledOn(thisObj);
            expect(updateSpy).to.be.calledWith({id: "b", sort: 40}, 2, 3);
            expect(removeSpy).to.be.calledOn(thisObj);
            expect(removeSpy).to.be.calledWith({id: "b", sort: 40}, 3);
        });

        it("calls delegates referenced as strings on this object", function() {
            var thisObj = {
                insertSpy: insertSpy,
                removeSpy: removeSpy,
                updateSpy: updateSpy
            };
            store.query({}, {sort: [{attribute: "sort"}]}).observe(
                delegateObserve("insertSpy", "removeSpy", "updateSpy", thisObj), true);
            store.add({id: "foo", sort: 15});
            store.put({id: "b", sort: 40});
            store.remove("b");
            expect(insertSpy).to.be.calledOn(thisObj);
            expect(insertSpy).to.be.calledWith({id: "foo", sort: 15}, 1);
            expect(updateSpy).to.be.calledOn(thisObj);
            expect(updateSpy).to.be.calledWith({id: "b", sort: 40}, 2, 3);
            expect(removeSpy).to.be.calledOn(thisObj);
            expect(removeSpy).to.be.calledWith({id: "b", sort: 40}, 3);
        });

        it("handles missing insert", function() {
            var thisObj = {};
            store.query({}, {sort: [{attribute: "sort"}]}).observe(
                delegateObserve(null, removeSpy, updateSpy, thisObj), true);
            store.add({id: "foo", sort: 15});
            store.put({id: "b", sort: 40});
            store.remove("b");
            expect(insertSpy).not.to.be.called;
            expect(updateSpy).to.be.calledOn(thisObj);
            expect(updateSpy).to.be.calledWith({id: "b", sort: 40}, 2, 3);
            expect(removeSpy).to.be.calledOn(thisObj);
            expect(removeSpy).to.be.calledWith({id: "b", sort: 40}, 3);
        });

        it("handles missing remove", function() {
            var thisObj = {};
            store.query({}, {sort: [{attribute: "sort"}]}).observe(
                delegateObserve(insertSpy, null, updateSpy, thisObj), true);
            store.add({id: "foo", sort: 15});
            store.put({id: "b", sort: 40});
            store.remove("b");
            expect(insertSpy).to.be.calledOn(thisObj);
            expect(insertSpy).to.be.calledWith({id: "foo", sort: 15}, 1);
            expect(updateSpy).to.be.calledOn(thisObj);
            expect(updateSpy).to.be.calledWith({id: "b", sort: 40}, 2, 3);
            expect(removeSpy).not.to.be.called;
        });

        it("handles missing update", function() {
            var thisObj = {};
            store.query({}, {sort: [{attribute: "sort"}]}).observe(
                delegateObserve(insertSpy, removeSpy, null, thisObj), true);
            store.add({id: "foo", sort: 15});
            store.put({id: "b", sort: 40});
            store.remove("b");
            expect(insertSpy).to.be.calledOn(thisObj);
            expect(insertSpy).to.be.calledWith({id: "foo", sort: 15}, 1);
            expect(updateSpy).not.to.be.called;
            expect(removeSpy).to.be.calledOn(thisObj);
            expect(removeSpy).to.be.calledWith({id: "b", sort: 40}, 3);
        });

    });
});