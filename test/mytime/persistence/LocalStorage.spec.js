/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define([
    "dojo/store/Memory",
    "mytime/persistence/LocalStorage",
    "mytime/model/TimeEntry"
], function(
    Memory,
    LocalStorage,
    TimeEntry
) {
    describe("mytime/persistence/LocalStorage", function() {

        it("stores and retrieves an array of objects", function() {
            LocalStorage.persistStoreData("theKey", [
                {id: "A", value: 1},
                {id: "B", value: 2}
            ]);

            var retrieved = LocalStorage.retrieveStoreData("theKey");

            expect(retrieved).to.deep.equal([
                {id: "A", value: 1},
                {id: "B", value: 2}
            ]);
        });

        it("stores and retrieves an array of TimeEntries", function() {
            LocalStorage.persistStoreData("theKey", [
                new TimeEntry({id: "A", startHour: 8}),
                new TimeEntry({id: "B", startHour: 10.5})
            ]);

            var retrieved = LocalStorage.retrieveStoreData("theKey", TimeEntry);

            expect(retrieved).not.to.deep.equal([
                {id: "A", startHour: 8},
                {id: "B", startHour: 10.5}
            ]);
            expect(retrieved).to.deep.equal([
                new TimeEntry({id: "A", startHour: 8}),
                new TimeEntry({id: "B", startHour: 10.5})
            ]);

            expect(retrieved[0] instanceof TimeEntry).to.be.true;
            expect(retrieved[0]).to.have.property("id", "A");
            expect(retrieved[0]).to.have.property("startHour", 8);
            expect(retrieved[0]).to.have.property("endHour", null);
        });

        it("stores and retrieves a store", function() {
            var store = new Memory();
            store.add({id: "A", value: 1});
            store.add({id: "B", value: 2});

            LocalStorage.persistStore("theKey", store);

            var retrieved = LocalStorage.loadStore("theKey", new Memory());

            expect(retrieved.query()).to.have.property("total", 2);
            expect(retrieved.get("A")).to.deep.equal({id: "A", value: 1});
            expect(retrieved.get("B")).to.deep.equal({id: "B", value: 2});
        });

        it("stores and retrieves a store or TimeEntries", function() {
            var store = new Memory();
            store.add(new TimeEntry({id: "A", startHour: 8}));
            store.add(new TimeEntry({id: "B", startHour: 10.5}));

            LocalStorage.persistStore("theKey", store);

            var retrieved = LocalStorage.loadStore("theKey", new Memory(), TimeEntry);

            expect(retrieved.query()).to.have.property("total", 2);
            expect(retrieved.get("A") instanceof TimeEntry).to.be.true;
        });

    });
});