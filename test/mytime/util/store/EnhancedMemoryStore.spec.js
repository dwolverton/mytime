/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "mytime/util/store/EnhancedMemoryStore"
], function(
    EnhancedMemoryStore
) {
    describe("mytime/util/store/EnhancedMemoryStore", function() {
    
        it("size()", function() {
            var store = new EnhancedMemoryStore();
            expect(store.size()).to.equal(0);
            store.put({id: "a", x: 1});
            expect(store.size()).to.equal(1);
            store.put({id: "b", x: 2});
            expect(store.size()).to.equal(2);
            store.remove("a");
            expect(store.size()).to.equal(1);
        });
    
        it("clear()", function() {
            var store = new EnhancedMemoryStore();
            store.put({id: "a", x: 1});
            store.put({id: "b", x: 2});
            store.clear();
            expect(store.size()).to.equal(0);
            expect(store.get("a")).not.to.be.ok;
        });
    
        it("observe()", function() {
            var store = EnhancedMemoryStore.createObservable();
            var spy = sinon.spy();
            store.observe(spy);
    
            var a;
            store.put(a = {id: "a", x: 1});
            expect(spy).to.have.been.calledWith(a, -1, 0);
    
            spy.reset();
            store.remove("a");
            expect(spy).to.have.been.calledWith(a, 0, -1);
        });
    
        it("size() observable", function() {
            var store = EnhancedMemoryStore.createObservable();
            expect(store.size()).to.equal(0);
            store.put({id: "a", x: 1});
            expect(store.size()).to.equal(1);
            store.put({id: "b", x: 2});
            expect(store.size()).to.equal(2);
            store.remove("a");
            expect(store.size()).to.equal(1);
        });
    
        it("clear() observable", function() {
            var store = EnhancedMemoryStore.createObservable();
            var a,b;
            store.put(a = {id: "a", x: 1});
            store.put(b = {id: "b", x: 2});
    
            var spy = sinon.spy();
            store.observe(spy);
    
            store.clear();
            expect(store.size()).to.equal(0);
            expect(store.get("a")).not.to.be.ok;
    
            expect(spy).to.have.been.calledWith(a, 0, -1);
            expect(spy).to.have.been.calledWith(b, 1, -1);
        });

        describe("query", function() {

            var store;
            before(function() {
                store = EnhancedMemoryStore.createObservable();
                store.put({id: "a", x: 1});
                store.put({id: "b", x: 2});
                store.put({id: "c", x: 3});
                store.put({id: "d", x: 4});
            });

            function verifyQueryResult(query, expectedIds) {
                expectIds(store.query(query), expectedIds);
            }

            function expectIds(result, expectedIds) {
                expect(result).to.have.length(expectedIds.length);
                for (var i = 0; i < expectedIds.length; i++) {
                    expect(result[i].id).to.equal(expectedIds[i]);
                }
            }

            it("is queryable with standard query", function() {
                verifyQueryResult({ "x": 3 }, ["c"]);
            });

            it("is queryable with less than", function() {
                verifyQueryResult({ "x<": 3 }, ["a", "b"]);
            });

            it("is queryable with less or equal", function() {
                verifyQueryResult({ "x<=": 3 }, ["a", "b", "c"]);
            });

            it("is queryable with greater than", function() {
                verifyQueryResult({ "x>": 2 }, ["c", "d"]);
            });
            it("is queryable with greater or equal", function() {
                verifyQueryResult({ "x>=": 2 }, ["b", "c", "d"]);
            });

            it("is queryable with multiple less/greater criteria", function() {
                verifyQueryResult({ "x>=": 2, "x<": 4 }, ["b", "c"]);
            });

            it("is queryable with combination of compare and standard", function() {
                verifyQueryResult({ "x>=": 2, "x": 4 }, ["d"]);
                verifyQueryResult({ "x<=": 2, "x": 4 }, []);
            });

        });

    });
});