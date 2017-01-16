define([
    "mytime/util/jira"
], function (
    jira) {
    "use strict";

    describe("mytime/util/jira", function() {

        it("identifies JIRA issue key strings", function() {
            expect(jira.isJiraIssueKey(null)).to.be.false;
            expect(jira.isJiraIssueKey("")).to.be.false;
            expect(jira.isJiraIssueKey("JJ-")).to.be.false;
            expect(jira.isJiraIssueKey("-17")).to.be.false;
            expect(jira.isJiraIssueKey("CAYENNE")).to.be.false;
            expect(jira.isJiraIssueKey("CAYENNE 34")).to.be.false;
            expect(jira.isJiraIssueKey("JJ-17")).to.be.true;
            expect(jira.isJiraIssueKey("A-1")).to.be.true;
            expect(jira.isJiraIssueKey("CAYENNE-3492")).to.be.true;
        });

        it("correctly builds time logging links", function() {
            var timeEntry = {
                id: '443',
                text: 'Oh happy day :)!',
                startHour: 12.5,
                endHour: 14.0
            };
            expect(jira.buildTimeLoggingLink('CODE-123', timeEntry)).to.equal(
                "https://jira.vodori.com/secure/CreateWorklog!default.jspa?key=CODE-123&timeLogged=1.50h&timeEntyId=443&comment=Oh%20happy%20day%20%3A)!"
            );
        });

        it("builds time logging link with empty comment when text is undefined", function() {
            var timeEntry = {
                id: '443',
                startHour: 12.5,
                endHour: 14.0
            };
            expect(jira.buildTimeLoggingLink('CODE-123', timeEntry)).to.equal(
                "https://jira.vodori.com/secure/CreateWorklog!default.jspa?key=CODE-123&timeLogged=1.50h&timeEntyId=443&comment="
            );
        });

        it("rounds time to two decimals for time logging link", function() {
            var timeEntry = {
                id: '443',
                startHour: 2,
                endHour: 22.849
            };
            expect(jira.buildTimeLoggingLink('CODE-123', timeEntry)).to.equal(
                "https://jira.vodori.com/secure/CreateWorklog!default.jspa?key=CODE-123&timeLogged=20.85h&timeEntyId=443&comment="
            );
        });

    });
});