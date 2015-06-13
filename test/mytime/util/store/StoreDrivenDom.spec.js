/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "dojo/store/Memory", "dojo/store/Observable", "dojo/dom-construct",
    "mytime/util/store/StoreDrivenDom"
], function(
    Memory, Observable, domConstruct,
    StoreDrivenDom
    ) {

    describe("mytime/util/store/StoreDrivenDom", function() {

        var source;
        var renderer;
        beforeEach(function() {
            source = new Observable(new Memory());
            source.add({id: "a", sort: 10, type: "div"});
            source.add({id: "b", sort: 20, type: "span"});
            source.add({id: "c", sort: 30, type: "em"});
            renderer = function(data) {
                return domConstruct.create(data.type, {id: data.id});
            };
        });

        function setup() {
            return new StoreDrivenDom({
                store: source,
                queryOptions: {sort: [{attribute: "sort"}]},
                renderNode: renderer
            });
        }

        it("transforms initial results", function() {
            var widget = setup();
            expect(widget.domNode.innerHTML).to.equal('<div id="a"></div><span id="b"></span><em id="c"></em>');
        });
        it("updates when store changed");
        it("updates when query changed", function() {
            var widget = setup();
            widget.set("query", {id: "b"});
            expect(widget.domNode.innerHTML).to.equal('<span id="b"></span>');
        });
        it("updates when renderNode changed", function() {
            var widget = setup();
            widget.set("renderNode", function(data) {
                return domConstruct.create(data.type, {id: data.id, innerHTML: 'Hi'});
            });
            expect(widget.domNode.innerHTML).to.equal('<div id="a">Hi</div><span id="b">Hi</span><em id="c">Hi</em>');
        });
        it("updates when result added", function() {
            var widget = setup();
            source.put({id: "d", sort: 40, type: "br"});
            expect(widget.domNode.innerHTML).to.equal('<div id="a"></div><span id="b"></span><em id="c"></em><br id="d">');
        });
        it("updates when result removed", function() {
            var widget = setup();
            source.remove("c");
            expect(widget.domNode.innerHTML).to.equal('<div id="a"></div><span id="b"></span>');
        });
        it("updates when result updated", function() {
            var widget = setup();
            source.put({id: "c", sort: 35, type: "br"});
            expect(widget.domNode.innerHTML).to.equal('<div id="a"></div><span id="b"></span><br id="c">');
        });
        it("allows renderNode to return an HTML string", function() {
            var widget = setup();
            widget.set("renderNode", function(data) {
                return '<span>' + data.id + '</span>';
            });
            expect(widget.domNode.innerHTML).to.equal('<span>a</span><span>b</span><span>c</span>');
        });
        it("does not display a node when renderNode returns falsy");

    });
});