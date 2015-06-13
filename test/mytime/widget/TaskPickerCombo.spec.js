/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "mytime/widget/TaskPickerCombo"
], function(
    TaskPickerCombo
) {
    describe("mytime/widget/TaskPickerCombo", function() {

        function parse(string) {
            return TaskPickerCombo.prototype._parseStringToTask(string);
        }

        it("#_parseStringToTask", function() {
             expect(parse("")).to.equal(null);
             expect(parse("    ")).to.equal(null);
             expect(parse("A")).to.deep.equal(null);
             expect(parse("AA")).to.deep.equal({ code: "AA" });
             expect(parse("ARP-123")).to.deep.equal({ code: "ARP-123" });
             expect(parse("ARP-123 ")).to.deep.equal({ code: "ARP-123" });
             expect(parse("ARP-123 h")).to.deep.equal({ code: "ARP-123", name: "h" });
             expect(parse("ARP-123 Hello World")).to.deep.equal({ code: "ARP-123", name: "Hello World" });
             expect(parse("ARP-123    Hello World    ")).to.deep.equal({ code: "ARP-123", name: "Hello World" });
        });
    });
});