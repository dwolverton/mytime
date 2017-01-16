define(['dojo/_base/lang', 'dojo/_base/declare', "dijit/Destroyable",
        "mytime/command/GetJiraPicklistCommand", "mytime/rest/GetJiraPicklistRequest"],
function (lang, declare, Destroyable,
          GetJiraPicklistCommand, GetJiraPicklistRequest) {

    return declare([Destroyable], {

        requestQueue: null,

        constructor: function(args) {
            lang.mixin(this, args);
            this.own(
                GetJiraPicklistCommand.subscribe(lang.hitch(this, "handlePicklist"))
            );
        },

        handlePicklist: function(command) {
            var request = new GetJiraPicklistRequest(command.query);
            request.then(lang.hitch(command, 'resolve'));
            this.requestQueue.push(request);
        },

        handleUpdate: function(command) {

        }

    });
});