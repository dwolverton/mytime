define([
    "lodash", "exports",
    "dojo/_base/lang", "dojo/_base/declare",
    "mytime/util/DateTimeUtil"
], function (
    _, exports,
    lang, declare,
    DateTimeUtil) {

    /**
     * Does the given string match the JIRA issue key format.
     * @param {string} s
     */
    exports.isJiraIssueKey = function(s) {
        return !! ( s && s.match(/^[A-Z]+-\d+$/) );
    };

    exports.buildTimeLoggingLink = function(issueKey, timeEntry) {
        return  "https://jira.vodori.com/secure/CreateWorklog!default.jspa?key=" + encodeURIComponent(issueKey) +
            "&timeLogged=" + DateTimeUtil.formatWithTwoDecimals( DateTimeUtil.duration(timeEntry) ) +
            "h&timeEntyId=" + encodeURIComponent(timeEntry.id) +
            "&comment=" + encodeURIComponent(timeEntry.text || "");
    };
});