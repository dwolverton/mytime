/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define(["mytime/util/DateTimeUtil"], function(DateTimeUtil) {
    
    describe("mytime/util/DateTimeUtil", function() {
    
        it("beginningOfHour", function() {
            expect(DateTimeUtil.beginningOfHour(10)).to.equal(10);
            expect(DateTimeUtil.beginningOfHour(10.2)).to.equal(10);
            expect(DateTimeUtil.beginningOfHour(10.999)).to.equal(10);
        });
    
        it("percentageOfHour", function() {
            expect(DateTimeUtil.percentageOfHour(10)).to.equal(0);
            expect(DateTimeUtil.percentageOfHour(10.2)).to.equal(20);
            expect(DateTimeUtil.percentageOfHour(10.999)).to.equal(100);
        });
    
        it("convertDateObjectToDateString", function() {
            expect(DateTimeUtil.convertDateObjectToDateString(new Date("Jan 1 2013"))).to.equal("2013-01-01");
            expect(DateTimeUtil.convertDateObjectToDateString(new Date("Dec 31 2013"))).to.equal("2013-12-31");
            expect(DateTimeUtil.convertDateObjectToDateString(new Date("June 11 1932"))).to.equal("1932-06-11");
        });

        it("calculates duration regardless of order", function() {
            expect(DateTimeUtil.duration(13.25, 10)).to.equal(3.25);
            expect(DateTimeUtil.duration(7.5, 10)).to.equal(2.5);
        });
        it("calculates duration from TimeEntry", function() {
            expect(DateTimeUtil.duration({ startHour: 12, endHour: 16})).to.equal(4);
        });

    });

});