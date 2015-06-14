/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "lodash",
    "dojo/_base/declare", "dojo/Evented",
    "dojo/store/Memory", "dojo/store/Observable",
    "mytime/widget/TimeEntryDetails", "mytime/model/Task", "mytime/model/TimeEntry",
    "test/MockDependencyLoader"
], function(_, declare, Evented, Memory, Observable, TimeEntryDetails, Task, TimeEntry, MockDependencyLoader) {

    describe("mytime/TimeEntryDetails", function() {

        var widget, model, view, timeEntryStore, taskStore;
        var taskA, taskB, entryWithTask, entryWithoutTask;

        var MockView = declare([], {

        });

        var TimeEntryDetailsWithMocks = MockDependencyLoader.loadModuleWithOverriddenDependencies("mytime/widget/TimeEntryDetails", {
            "mytime/widget/TimeEntryDetails/TimeEntryDetailsView": MockView
        });

        function initStores() {
            timeEntryStore = new Observable(new Memory());
            taskStore = new Observable(new Memory());

            taskStore.add(taskA = new Task({id: "A", description: "Alpha"}));
            taskStore.add(taskB = new Task({id: "B", description: "Beta"}));
            timeEntryStore.add(entryWithTask = new TimeEntry({id: "has-task", taskId: "A"}));
            timeEntryStore.add(new TimeEntry({id: "has-task2", taskId: "A"}));
            timeEntryStore.add(entryWIthoutTask = new TimeEntry({id: "no-task"}));
        }

        function initWidget() {
            initStores();
            //widget = new TimeEntryDetails({timeEntryStore: timeEntryStore, taskStore: taskStore});
            widget = new TimeEntryDetails();
            widget.set('timeEntryStore', timeEntryStore);
            widget.set('taskStore', taskStore);
            model = widget._model;
            view = widget._view;
        }

        it('updates model and view when selectedId set', function() {
            initWidget();
            widget.set('selectedId', 'has-task');
            expect(model.task).to.equal(taskA);
        });
        it('appears when selectedId set', function() {
            initWidget();
            sinon.stub(view, 'show');
            widget.set('selectedId', 'no-task');
            expect(view.show).to.have.been.called;
        });
        it('disappears when selectedId unset', function() {
            initWidget();
            widget.set('selectedId', 'no-task');
            sinon.stub(view, 'hide');
            widget.set('selectedId', null);
            expect(view.hide).to.have.been.called;
        });

        it('when unique description entered AND no task assigned, creates new task and assigns');
        it('when unique description entered AND already has task, changes name of task');
        it('when existing description entered AND no task assigned, assigns that task');
        it('when existing description entered AND already has task, assigns that task');
    });

});