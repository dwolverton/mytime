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
    "mytime/command/CreateTaskCommand", "mytime/command/UpdateTaskCommand", "mytime/command/UpdateTimeEntryCommand",
    "test/MockDependencyLoader"
], function(_, declare, Evented, Memory, Observable, TimeEntryDetails, Task, TimeEntry,
            CreateTaskCommand, UpdateTaskCommand, UpdateTimeEntryCommand, MockDependencyLoader) {

    describe("mytime/TimeEntryDetails", function() {

        var widget, model, view, timeEntryStore, taskStore;
        var taskA, taskB, entryWithTask, entryWithoutTask;
        var createTaskCommand = setupCommandListener(CreateTaskCommand, 'task');
        var updateTaskCommand = setupCommandListener(UpdateTaskCommand, 'task');
        var updateTimeEntryCommand = setupCommandListener(UpdateTimeEntryCommand, 'timeEntry');

        var MockView = declare([Evented], {
        });

        var TimeEntryDetailsWithMocks = MockDependencyLoader.loadModuleWithOverriddenDependencies("mytime/widget/TimeEntryDetails", {
            "mytime/widget/TimeEntryDetails/TimeEntryDetailsView": MockView
        });

        function setupCommandListener(command, propertyOfCommand) {
            var handle;
            var listener = sinon.stub();

            beforeEach(function() {
                handle = command.subscribe(function(cmd) {
                    var result = listener(cmd[propertyOfCommand]);
                    cmd.resolve(result);
                });
            });

            afterEach(function() {
                handle.remove();
                listener.reset();
            });
            return listener;
        }

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

        it('when unique description entered AND no task assigned, creates new task and assigns', function() {
            initWidget();
            widget.set('selectedId', 'no-task');

            createTaskCommand.returns({ taskId: 'C', task: { id: 'C', description: 'something new'}});

            view.emit('taskSelected', { id: null, description: "something new" });
            expect(createTaskCommand).to.have.been.calledWith({ description: "something new"});
            expect(updateTaskCommand).not.to.have.been.called;
            expect(updateTimeEntryCommand).to.have.been.calledWith({ id: 'no-task', taskId: 'C'});
        });
        it('when unique description entered AND already has task, changes name of task', function() {
            initWidget();
            widget.set('selectedId', 'has-task');

            //updateTaskCommand.returns({ taskId: 'A', task: { id: 'A', description: 'something new'}});

            view.emit('taskSelected', { id: null, description: "something new" });
            expect(createTaskCommand).not.to.have.been.called;
            expect(updateTaskCommand).to.have.been.calledWith(new Task({ id: 'A', description: "something new"}));
            expect(updateTimeEntryCommand).not.to.have.been.called;
        });
        it('when existing description entered AND no task assigned, assigns that task', function() {
            initWidget();
            widget.set('selectedId', 'no-task');

            view.emit('taskSelected', { id: 'B', description: "Beta" });
            expect(createTaskCommand).not.to.have.been.called;
            expect(updateTaskCommand).not.to.have.been.called;
            expect(updateTimeEntryCommand).to.have.been.calledWith({ id: 'no-task', taskId: 'B'});
        });
        it('when existing description entered AND already has task, assigns that task', function() {
            initWidget();
            widget.set('selectedId', 'has-task');

            view.emit('taskSelected', { id: 'B', description: "Beta" });
            expect(createTaskCommand).not.to.have.been.called;
            expect(updateTaskCommand).not.to.have.been.called;
            expect(updateTimeEntryCommand).to.have.been.calledWith({ id: 'has-task', taskId: 'B'});
        });
        it('when description unset, unassign task', function() {
            initWidget();
            widget.set('selectedId', 'has-task');

            view.emit('taskSelected', null);
            expect(createTaskCommand).not.to.have.been.called;
            expect(updateTaskCommand).not.to.have.been.called;
            expect(updateTimeEntryCommand).to.have.been.calledWith({ id: 'has-task', taskId: null});
        });


        it('when the selected task has other entries, displays the option to fork a new task, including info about latest related time entry');
        it('when the selected task has no other entries, does not display the option to fork a new task');

        it('when a JIRA is selected AND task already assigned, set the JIRA key on the task');
        it('when a JIRA is unselected AND task already assigned, unset the JIRA key on the task');
        it('when a JIRA is selected AND no task assigned AND another task exist with same JIRA key, assign that task to the entry');
        it('when a JIRA is selected AND no task assigned AND no other task exists with same JIRA key, create a new task with the JIRA description and assign to the entry');
    });

});