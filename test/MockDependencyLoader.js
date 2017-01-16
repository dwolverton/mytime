/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 *
 * This module contributed by Vodori (https://www.vodori.com/)
 */
define([
    'require',
    'lodash',
    'dojo/_base/lang'
],
function(
    require,
    _,
    lang
    ) {

    /**
     * A set of utilities that allow AMD modules and dependencies to be mocked.
     *
     * @note Dojo is assumed.
     */
    return {

        /**
         * Load a new version of the given module. The module will be loaded with the specified
         * dependencies replaced by the given implementations.
         * @note The original module must be loaded before this is run.
         * @param moduleId
         * @param {Object.<string, *>} dependencyOverrides A map of dependencies to override. Key:
         *        ID of the module to override. Value: the implementation to use for that module.
         * @returns {*} The AMD module.
         */
        loadModuleWithOverriddenDependencies: function(moduleId, dependencyOverrides) {
            if (!dependencyOverrides) {
                dependencyOverrides = {};
            }
            var modDef = require.modules[moduleId];
            if (!modDef) {
                throw 'The original module (' + moduleId +
                    ') must be loaded before it can be loaded with loadModuleWithOverriddenDependencies().';
            }

            var dependencies = _.clone(modDef.deps);
            var factory = modDef.def;
            var exports = {};
            // Use a new module ID, so as not to mess with the original.
            var mockMid = this._findNextAvailableUniqueModuleId(modDef.mid + '-mock');
            _.forEach(dependencies, lang.hitch(this, function(dependency, idx) {
                if (dependency.mid in dependencyOverrides) {
                    dependencies[idx] = dependencyOverrides[dependency.mid];
                } else {
                    switch (dependency.mid) {
                    case 'module':
                        var tweakedModule = _.clone(modDef.cjs);
                        tweakedModule.id = mockMid;
                        dependencies[idx] = tweakedModule;
                        break;
                    case 'exports':
                        dependencies[idx] = exports;
                        break;
                    case 'require':
                        var tweakedRequire = this.createRequireFunctionWithOverriddenDependencies(modDef.require, dependencyOverrides);
                        tweakedRequire.module = _.clone(tweakedRequire.module);
                        tweakedRequire.module.id = mockMid;
                        dependencies[idx] = tweakedRequire;
                        break;
                    default:
                        dependencies[idx] = dependency.result;
                        break;
                    }
                }
            }));

            var result = factory.apply(null, dependencies);
            return _.isUndefined(result) ? exports : result;
        },

        /**
         * Append a number to the given base id so that it is unique in the AMD cache.
         * @param baseMid
         * @returns {string} the unique mid
         * @private
         */
        _findNextAvailableUniqueModuleId: function(baseMid) {
            var mid,
                i = 0,
                alreadyUsed = true;
            while (alreadyUsed) {
                i++;
                mid = baseMid + i;
                alreadyUsed = require.modules[mid] ||
                              lang.getObject(mid) ||
                              lang.getObject(mid.replace(/\//g, '.'));
            }

            return mid;
        },

        /**
         * Create a new AMD require function that replaces specific modules with a different
         * implementation.
         * @param {function} originalRequire the original 'require' function to replace
         * @param {Object.<string, *>} dependencyOverrides Key: ID of the module to override. Value:
         *        the different implementation to use for that module.
         * @returns {Function}
         */
        createRequireFunctionWithOverriddenDependencies: function(originalRequire, dependencyOverrides) {
            var moduleIdMapping = this._mapModulesToMockModuleIds(dependencyOverrides);

            var tweakedRequire = function(dependencyIds) {
                if (_.isArray(dependencyIds)) {
                    _.forEach(dependencyIds, function(mid, idx) {
                        if (mid in dependencyOverrides) {
                            dependencyIds[idx] = moduleIdMapping[mid];
                        }
                    });
                }
                originalRequire.apply(this, arguments);
            };

            lang.mixin(tweakedRequire, originalRequire);
            return tweakedRequire;
        },

        /**
         * Add modules to the AMD cache with unique made-up names.
         * @param {Object.<string, *>} modules Key: original module ID. Value: the resolved module.
         * @return {Object.<string, string>} Key: original module ID. Value: the made up name
         *         under which the module is now cached
         * @private
         */
        _mapModulesToMockModuleIds: function(modules) {
            var mapping = {};
            _.forOwn(modules, lang.hitch(this, function(module, mid) {
                var mockId = this._findNextAvailableUniqueModuleId('test-utils/mock');
                this._injectAmdModule(mockId, module);
                mapping[mid] = mockId;
            }));
            return mapping;
        },

        _injectAmdModule: function(mid, module) {
            define(mid, [], function() { return module; });
        }
    };
});