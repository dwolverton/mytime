define([
    'lodash',
    'dojo/on', 'dojo/query',
    'mytime/widget/TaskForm', 'mytime/model/Task'
], function (
    _,
    on, query,
    TaskForm, Task) {
    'use strict';

    describe('mytime/widget/TaskForm', function() {

        var form;

        var originTask = new Task({
            id: 'A',
            code: 'ABC-100',
            name: 'Always be Closing',
            color: '60,100'
        });

        beforeEach(function() {

        });

        afterEach(function() {

        });

        function getInput(name) {
            return _.find(form.form.getChildren(), function(input) {
                return input.get('name') === name;
            });
        }

        function click(cssSelector) {
            var node = query(cssSelector, form.domNode)[0];
            on.emit(node, 'click', {
                bubbles: true,
                cancelable: true
            });
        }

        it('populates the form from the value', function() {
            form = new TaskForm({value: originTask});
            expect(getInput('code').get('value')).to.equal('ABC-100');
            expect(getInput('name').get('value')).to.equal('Always be Closing');
            expect(getInput('color').get('value')).to.equal('60,100');
        });
        it('gets the value from the form', function() {
            form = new TaskForm({value: originTask});
            getInput('name').set('value', 'Name 2');
            getInput('color').set('value', '200,50');
            var value = form.get('value');
            expect(value instanceof Task).to.be.true;
            expect(value).to.have.property('id', 'A');
            expect(value).to.have.property('code', 'ABC-100');
            expect(value).to.have.property('name', 'Name 2');
            expect(value).to.have.property('color', '200,50');
        });
        it('emits submit when click submit', function() {
            form = new TaskForm({value: originTask});
            var spy = sinon.spy();
            form.on('submit', spy);
            click('input[type=submit]');
            expect(spy).to.be.calledOnce;
            expect(spy).to.be.calledWith(form.get('value'));
        });
        it('emits cancel when click cancel', function() {
            form = new TaskForm({value: originTask});
            var spy = sinon.spy();
            form.on('cancel', spy);
            click('a');
            expect(spy).to.be.calledOnce;
        });

    });
});