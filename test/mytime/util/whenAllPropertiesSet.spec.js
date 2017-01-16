/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "dojo/Stateful",
    "mytime/util/whenAllPropertiesSet"
], function(
    Stateful,
    whenAllPropertiesSet
) {

    describe("mytime/util/whenAllPropertiesSet", function() {

        var spy;
        beforeEach(function() {
            spy = sinon.spy();
        });

        it("calls callback immediately when all 1 properties are already set", function() {
            var stateful = new Stateful({one : 1});
            whenAllPropertiesSet(stateful, ['one'], spy);
            expect(spy).to.have.been.called;
        });
        it("calls callback immediately when all 3 properties are already set", function() {
            var stateful = new Stateful({one: true, two: 'yes', three: {}});
            whenAllPropertiesSet(stateful, ['one', 'two', 'three'], spy);
            expect(spy).to.have.been.called;
        });
        it("calls callback when the only property is set", function() {
            var stateful = new Stateful();
            whenAllPropertiesSet(stateful, ['one'], spy);
            expect(spy).not.to.have.been.called;
            stateful.set('one', true);
            expect(spy).to.have.been.called;
        });
        it("calls callback when last property is set", function() {
            var stateful = new Stateful();
            whenAllPropertiesSet(stateful, ['one', 'two', 'three'], spy);
            stateful.set('one', true);
            stateful.set('two', 'yes');
            expect(spy).not.to.have.been.called;
            stateful.set('three', {});
            expect(spy).to.have.been.called;
        });
        it("does not call callback when last property is set again to an empty value", function() {
            var stateful = new Stateful();
            whenAllPropertiesSet(stateful, ['one', 'two', 'three'], spy);
            stateful.set('one', true);
            stateful.set('two', 'yes');
            stateful.set('three', null);
            expect(spy).not.to.have.been.called;
            stateful.set('three', {});
            expect(spy).to.have.been.called;
        });
        it("does not call callback when some property is set again to an empty value", function() {
            var stateful = new Stateful();
            whenAllPropertiesSet(stateful, ['one', 'two', 'three'], spy);
            stateful.set('one', true);
            stateful.set('two', null);
            stateful.set('three', {});
            expect(spy).not.to.have.been.called;
            stateful.set('two', 'yes');
            expect(spy).to.have.been.called;
        });
        it("calls callback when some properties were already set and last property becomes set", function() {
            var stateful = new Stateful({one: 1, two: 'yes'});
            whenAllPropertiesSet(stateful, ['one', 'two', 'three'], spy);
            expect(spy).not.to.have.been.called;
            stateful.set('three', {});
            expect(spy).to.have.been.called;
        });
        it("is not affected by other properties", function() {
            var stateful = new Stateful({four: 'foo'});
            whenAllPropertiesSet(stateful, ['one', 'two', 'three'], spy);
            stateful.set('one', true);
            stateful.set('two', 'yes');
            stateful.set('five', 'bar');
            expect(spy).not.to.have.been.called;
            stateful.set('three', {});
            expect(spy).to.have.been.called;
        });
        it("returns handle to unwatch", function() {
            var stateful = new Stateful();
            var handle = whenAllPropertiesSet(stateful, ['one'], spy);
            handle.remove();
            stateful.set('one', true);
            expect(spy).not.to.have.been.called;
        });
    });
});