/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "dojo/store/Memory", "dojo/store/Observable",
    "mytime/util/store/TransformingStoreView"
], function(
    Memory, Observable,
    TransformingStoreView
) {

    describe("mytime/util/store/TransformingStoreView", function() {

        var source;
        var unobservedSource;
        var observer;
        var transformer;
        beforeEach(function() {
            unobservedSource = new Memory();
            source = new Observable(unobservedSource);
            source.add({id: "a", sort: 10});
            source.add({id: "b", sort: 20});
            source.add({id: "c", sort: 30});
            observer = sinon.spy();
            transformer = sinon.spy(function(input) {
                if (input.exclude) {
                    return null;
                }
                return {
                    id: input.id,
                    sort: input.sort * 10
                };
            });
        });

        function setup() {
            return new TransformingStoreView({
                sourceStore: source,
                transform: transformer
            });
        }

        function setupWithObserver() {
            var observable = setup().getObservable();
            observable.query().observe(observer, true);
            return observable;
        }

        it("transforms initial results", function() {
            var store = setup();
            var queryResults = store.query();
            expect(queryResults).to.have.length(3);
            expect(queryResults[0]).to.deep.equal({id: "a", sort: 100});
            expect(queryResults[1]).to.deep.equal({id: "b", sort: 200});
            expect(queryResults[2]).to.deep.equal({id: "c", sort: 300});
        });
        it("updates when sourceStore changed");
        it("updates when sourceQuery changed", function() {
            var store = setup();
            store.set("sourceQuery", {id: "b"});
            var queryResults = store.query();
            expect(queryResults).to.have.length(1);
            expect(queryResults[0]).to.deep.equal({id: "b", sort: 200});
        });
        it("updates when transform changed", function() {
            var store = setup();
            store.set("transform", function(input) {
                return {
                    id: input.id,
                    sort: input.sort / 10
                };
            });
            var queryResults = store.query();
            expect(queryResults).to.have.length(3);
            expect(queryResults[0]).to.deep.equal({id: "a", sort: 1});
            expect(queryResults[1]).to.deep.equal({id: "b", sort: 2});
            expect(queryResults[2]).to.deep.equal({id: "c", sort: 3});
        });
        it("updates when result added", function() {
            var store = setup();
            source.put({id: "d", sort: 40});
            var queryResults = store.query();
            expect(queryResults).to.have.length(4);
            expect(queryResults[0]).to.deep.equal({id: "a", sort: 100});
            expect(queryResults[1]).to.deep.equal({id: "b", sort: 200});
            expect(queryResults[2]).to.deep.equal({id: "c", sort: 300});
            expect(queryResults[3]).to.deep.equal({id: "d", sort: 400});
        });
        it("updates when result removed", function() {
            var store = setup();
            source.remove("c");
            var queryResults = store.query();
            expect(queryResults).to.have.length(2);
            expect(queryResults[0]).to.deep.equal({id: "a", sort: 100});
            expect(queryResults[1]).to.deep.equal({id: "b", sort: 200});
        });
        it("updates when result updated", function() {
            var store = setup();
            source.put({id: "c", sort: 35});
            var queryResults = store.query();
            expect(queryResults).to.have.length(3);
            expect(queryResults[0]).to.deep.equal({id: "a", sort: 100});
            expect(queryResults[1]).to.deep.equal({id: "b", sort: 200});
            expect(queryResults[2]).to.deep.equal({id: "c", sort: 350});
        });
        it("notifies when result added", function() {
            setupWithObserver();
            source.put({id: "d", sort: 40});
            expect(observer).to.be.calledOnce;
            expect(observer).to.be.calledWith({id: "d", sort: 400}, -1, 3);
        });
        it("notifies when result removed", function() {
            setupWithObserver();
            source.remove("c");
            expect(observer).to.be.calledOnce;
            expect(observer).to.be.calledWith({id: "c", sort: 300}, 2, -1);
        });
        it("notifies when result updated", function() {
            var store = setup().getObservable();
            store.query({}, {sort: [{attribute: "sort"}]}).observe(observer);
            source.put({id: "c", sort: 5});
            expect(observer).to.be.calledOnce;
            expect(observer).to.be.calledWith({id: "c", sort: 50}, 2, 0);
        });
        it("notifies removal of all items then addition of all items when sourceQuery changed", function() {
            var store = setupWithObserver();
//            var store = setup();
            store.set("sourceQuery", {id: "b"});
            expect(store.query().length).to.equal(1);
            expect(observer.callCount).to.equal(4);
            expect(observer).to.be.calledWith({id: "c", sort: 300}, 2, -1);
            expect(observer).to.be.calledWith({id: "b", sort: 200}, 1, -1);
            expect(observer).to.be.calledWith({id: "a", sort: 100}, 0, -1);
            expect(observer).to.be.calledWith({id: "b", sort: 200}, -1, 0);
        });
        it("does not add an item when transform returns falsy", function() {
            var store = setup();
            source.put({id: "d", sort: 40, exclude: true});
            source.put({id: "e", sort: 50});
            var queryResults = store.query();
            expect(queryResults).to.have.length(4);
            expect(queryResults[0]).to.deep.equal({id: "a", sort: 100});
            expect(queryResults[1]).to.deep.equal({id: "b", sort: 200});
            expect(queryResults[2]).to.deep.equal({id: "c", sort: 300});
            expect(queryResults[3]).to.deep.equal({id: "e", sort: 500});
        });
        it("removes an item when transform returns falsy", function() {
            var store = setup();
            source.put({id: "b", sort: 40, exclude: true});
            source.put({id: "c", sort: 50});
            var queryResults = store.query();
            expect(queryResults).to.have.length(2);
            expect(queryResults[0]).to.deep.equal({id: "a", sort: 100});
            expect(queryResults[1]).to.deep.equal({id: "c", sort: 500});
        });

        describe("#refreshItem", function() {
            it("adds item if missing from view and notifies", function() {
                var store = setupWithObserver();
                // secretly add data without notifying the observer...
                unobservedSource.put({id: "d", sort: 40});
                expect(store.query()).to.have.length(3);
                expect(observer).not.to.be.called;

                store.refreshItem("d");
                var queryResults = store.query();
                expect(queryResults).to.have.length(4);
                expect(queryResults[0]).to.deep.equal({id: "a", sort: 100});
                expect(queryResults[1]).to.deep.equal({id: "b", sort: 200});
                expect(queryResults[2]).to.deep.equal({id: "c", sort: 300});
                expect(queryResults[3]).to.deep.equal({id: "d", sort: 400});
                expect(observer).to.be.calledOnce;
                expect(observer).to.be.calledWith({id: "d", sort: 400}, -1, 3);

            });
            it("removes item if missing from source and notifies", function() {
                var store = setupWithObserver();
                // secretly remove data without notifying the observer...
                unobservedSource.remove("c");
                expect(store.query()).to.have.length(3);
                expect(observer).not.to.be.called;

                store.refreshItem("c");
                var queryResults = store.query();
                expect(queryResults).to.have.length(2);
                expect(queryResults[0]).to.deep.equal({id: "a", sort: 100});
                expect(queryResults[1]).to.deep.equal({id: "b", sort: 200});
                expect(observer).to.be.calledOnce;
                expect(observer).to.be.calledWith({id: "c", sort: 300}, 2, -1);
            });
            it("updates item if changed and notifies", function() {
                var store = setup().getObservable();
                store.query({}, {sort: [{attribute: "sort"}]}).observe(observer);
                // secretly remove data without notifying the observer...
                unobservedSource.put({id: "c", sort: 5});
                expect(observer).not.to.be.called;

                store.refreshItem("c");
                var queryResults = store.query({}, {sort: [{attribute: "sort"}]});
                expect(queryResults).to.have.length(3);
                expect(queryResults[0]).to.deep.equal({id: "c", sort: 50});
                expect(queryResults[1]).to.deep.equal({id: "a", sort: 100});
                expect(queryResults[2]).to.deep.equal({id: "b", sort: 200});
                expect(observer).to.be.calledOnce;
                expect(observer).to.be.calledWith({id: "c", sort: 50}, 2, 0);
            });
            it("notifies if item in source query results", function() {
                var store = setupWithObserver();
                store.set("sourceQuery", {id: "b"});
                observer.reset();

                store.refreshItem("b");
                expect(observer).to.have.been.calledWith({id: "b", sort: 200}, 0, 0);
            });
            it("does nothing if item not in source query results", function() {
                var store = setupWithObserver();
                store.set("sourceQuery", {id: "b"});
                observer.reset();

                store.refreshItem("a");
                expect(observer).not.to.have.been.called;
            });
        });

    });
});