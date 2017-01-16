/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define(["dojo/store/Memory", "dojo/store/Observable", "dojo/Stateful"], function(MemoryStore, Observable, Stateful) {

    describe("dojo/store/Observable", function() {

        it("does NOT notify when a stateful property changes that changes query results", function() {
            var a = new Stateful({id: "a", x: 1});
            var b = new Stateful({id: "b", x: 2});

            var spy = sinon.spy();
            var store = new Observable(new MemoryStore());
            var results = store.query({x: 1});
            results.observe(spy, true);
            expect(results.length).to.equal(0);

            store.put(a);
            store.put(b);
            expect(results.length).to.equal(1);
            expect(spy).to.have.been.calledWith(a, -1, 0);
            spy.reset();

            b.set("x", 1);
            expect(results.length).not.to.equal(2);
            expect(spy).not.to.have.been.calledWith(b, -1, 1);
        });

        it("notifies when an object is re-put that changes query results", function() {
            var a = new Stateful({id: "a", x: 1});
            var b = new Stateful({id: "b", x: 2});

            var spy = sinon.spy();
            var store = new Observable(new MemoryStore());
            var results = store.query({x: 1});
            results.observe(spy, true);
            expect(results.length).to.equal(0);

            store.put(a);
            store.put(b);
            expect(results.length).to.equal(1);
            expect(spy).to.have.been.calledWith(a, -1, 0);
            spy.reset();

            b.set("x", 1);
            store.put(b);
            expect(results.length).to.equal(2);
            expect(spy).to.have.been.calledWith(b, -1, 1);
        });

        it("does not notify when changes are made to the underlying store without going through the Observable", function() {
            var originalStore = new MemoryStore();
            var observableStore = new Observable(originalStore);

            var spy = sinon.spy();
            observableStore.query().observe(spy);
            originalStore.put({id: 1, note: "put in original store"});
            observableStore.put({id: 2, note: "put in observable store"});
            expect(spy).to.have.been.calledOnce;
            expect(spy).to.have.been.calledWith({id: 2, note: "put in observable store"}, -1, sinon.match.number);
        });

    });

});