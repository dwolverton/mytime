/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "dojo/store/Memory", "dojo/store/Observable",
    "mytime/util/store/getAndObserve"
], function(
    Memory, Observable,
    getAndObserve
) {

    describe("mytime/util/store/getAndObserve", function() {

        var store, observable;
        var callback;
        beforeEach(function() {
            store = new Memory();
            store.add({id: "a", sort: 10});
            store.add({id: "b", sort: 20});
            store.add({id: "c", sort: 30});
            observable = new Observable(store);
            callback = sinon.spy();
        });

        it('calls callback with initial result', function() {
            getAndObserve(observable, "a", callback);
            expect(callback).to.have.been.calledWith({id: "a", sort: 10});
        });
        it('calls callback with null if no result', function() {
            getAndObserve(observable, "d", callback);
            expect(callback).to.have.been.calledWith(undefined);
        });
        it('calls callback when item added', function() {
            getAndObserve(observable, "d", callback);
            callback.reset();
            observable.add({id: "d", sort: 40});
            expect(callback).to.have.been.calledWith({id: "d", sort: 40});
        });
        it('calls callback when item modified', function() {
            getAndObserve(observable, "b", callback);
            callback.reset();
            observable.put({id: "b", sort: 50});
            expect(callback).to.have.been.calledWith({id: "b", sort: 50});
        });
        it('calls callback when item removed', function() {
            getAndObserve(observable, "c", callback);
            callback.reset();
            observable.remove("c");
            expect(callback).to.have.been.calledWith(null);
        });

        it('calls callback with initial result, even if store not observable', function() {
            getAndObserve(store, "a", callback);
            expect(callback).to.have.been.calledWith({id: "a", sort: 10});
        });

        it('returns handle to stop observation', function() {
            var handle1 = getAndObserve(observable, "a", callback);
            var handle2 = getAndObserve(store, "a", callback);
            callback.reset();
            handle1.remove();
            handle2.remove();

            observable.remove("a");
            expect(callback).not.to.have.been.called;
        });

    });
});