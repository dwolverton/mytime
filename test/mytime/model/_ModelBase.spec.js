/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "dojo/_base/declare", "mytime/model/_ModelBase"
], function(
    declare, _ModelBase
) {
    
    describe("mytime/model/_ModelBase", function() {

        var SubType = declare("SubType", [_ModelBase], {
            _propertyNames: ['prop1', 'prop2'],
            prop1: null,
            prop2: null
        });
    
        it("is aware of the properties of the subtype", function() {
            var instance = new SubType();
            var properties = instance.get('_propertyNames');
            expect(properties).to.have.length(2);
            expect(_.contains(properties, 'prop1')).to.be.true;
            expect(_.contains(properties, 'prop2')).to.be.true;
        });

        it("copies only the appropriate properties on construction", function() {
            var instance = new SubType({
                prop1: 'alpha', other: 'beta'
            });
            expect(instance.prop1).to.equal('alpha');
            expect(instance.prop2).to.equal(null);
            expect(instance.other).to.be.undefined;
        });

        it("updates from another object, overwriting only specified properties", function() {
            var instance = new SubType({
                prop1: 'alpha'
            });
            instance.updateFrom({
                prop2: 'beta',
                other: 'gamma'
            });
            expect(instance.prop1).to.equal('alpha');
            expect(instance.prop2).to.equal('beta');
            expect(instance.other).to.be.undefined;
        });

        it("updates from another object, overwriting all properties", function() {
            var instance = new SubType({
                prop1: 'alpha'
            });
            instance.updateFrom({
                prop2: 'beta',
                other: 'gamma'
            }, true);
            expect(instance.prop1).to.equal(null);
            expect(instance.prop2).to.equal('beta');
            expect(instance.other).to.be.undefined;
        });
    
    });

});