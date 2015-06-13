/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define(["dojo/Stateful"], function(Stateful) {

    describe("dojo/Stateful", function() {

        it("notifies of a change", function() {
            var o = new Stateful({a: 1, b: 2});
            var spy = sinon.spy();
            o.watch("a", spy);

            o.set("a", 3);
            expect(spy).to.have.been.calledWith("a", 1, 3);
        });

        it("even notifies when value is unchanged", function() {
            var o = new Stateful({a: 1, b: 2});
            var spy = sinon.spy();
            o.watch("a", spy);

            o.set("a", 1);
            expect(spy).to.have.been.calledWith("a", 1, 1);
        });

    });

});