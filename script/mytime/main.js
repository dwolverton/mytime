/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "mytime/model/modelRegistry",
    "mytime/model/TimeEntry", "mytime/model/Task",
    "mytime/controller/TimeEntryController", "mytime/controller/TaskController", "mytime/controller/JiraController",
    "mytime/rest/RequestQueue",
    "mytime/util/store/EnhancedMemoryStore",
    "mytime/persistence/LocalStorage",
    "mytime/mock-data"
], function(
    modelRegistry,
    TimeEntry, Task,
    TimeEntryController, TaskController, JiraController,
    RequestQueue,
    EnhancedMemoryStore,
    LocalStorage,
    mockData
) {
    modelRegistry.set("timeEntryStore", EnhancedMemoryStore.createObservable());
    modelRegistry.set("taskStore", EnhancedMemoryStore.createObservable());

    LocalStorage.loadStore("timeEntryStore", modelRegistry.get("timeEntryStore"), TimeEntry);
    LocalStorage.loadStore("taskStore", modelRegistry.get("taskStore"), Task);

    var requestQueue = new RequestQueue();
    new TimeEntryController({ requestQueue: requestQueue });
    new TaskController({ requestQueue: requestQueue });
    new JiraController({ requestQueue: requestQueue });

    //mockData();
});