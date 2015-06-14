/**
 * utilities for working with integrations
 */
define([
    "lodash", "exports"
], function (
    _, exports) {

    function getIntegrations(objectOrList) {
        if (_.isArray(objectOrList)) {
            return objectOrList;
        } else if (objectOrList) {
            return objectOrList.integrations;
        } else {
            return null;
        }
    }

    /**
     * @param object either a list of integrations or an object that has an 'integrations' property.
     * @param type type of integration to find or create. ex: 'jira'
     * @returns Object
     */
    exports.getOrAddIntegrationOfType = function(object, type) {
        var integrations = getIntegrations(object);
        if (!integrations) {
            integrations = [];
            object.integrations = integrations;
        }
        var integration = _.find(integrations, {type: type});
        if (!integration) {
            integration = {
                type: type
            };
            integrations.push(integration);
        }
        return integration;
    };

    /**
     * @param object either a list of integrations or an object that has an 'integrations' property.
     * @param type type of integration to find. ex: 'jira'
     * @returns Object
     */
    exports.getIntegrationOfType = function(object, type) {
        return _.find(getIntegrations(object), {type: type});
    };

    /**
     * @param object either a list of integrations or an object that has an 'integrations' property.
     * @param type type of integration to remove. ex: 'jira'
     * @return true if found and removed, false if not found
     */
    exports.removeIntegrationOfType = function(object, type) {
        var integrations = getIntegrations(object);
        if (!integrations) {
            return false;
        }
        var index = _.findIndex(object.integrations, {type: type});
        if (index != -1) {
            object.integrations.splice(index, 1);
            return true;
        }
        return false;
    };
});