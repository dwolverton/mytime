/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "test/mytime/controller/TimeEntryController.spec",
    "test/mytime/model/_ModelBase.spec",
    "test/mytime/persistence/LocalStorage.spec",
    "test/mytime/util/DateTimeUtil.spec",
    "test/mytime/util/jira.spec",
    "test/mytime/util/store/EnhancedMemoryStore.spec",
    "test/mytime/util/store/delegateObserve.spec",
    "test/mytime/util/store/StoreDrivenDom.spec",
    "test/mytime/util/store/TransformingStoreView.spec",
    "test/mytime/util/whenAllPropertiesSet.spec",
    "test/mytime/widget/DailyTimeWidget/DailyTimeWidgetStore.spec",
    "test/mytime/widget/DailyTimeWidget/DailyTimeWidgetView.spec",
    "test/mytime/widget/TaskForm.spec",
    "test/mytime/widget/TaskPickerCombo.spec",

    "test/dojo/Stateful.spec",
    "test/dojo/store/Observable.spec"
], {});