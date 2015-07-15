var Dictionary = require('./dictionary');
/**
 * Generic blueprint manager.  What this will do is allow you
 * to define a hierarchy of templates that descend from each other.
 * when creating a blueprint, it will walk up the entire tree of the
 * hierarchy and fill in any blank values that are provided at parent levels
 * and give you a fully hydrated blueprint.
 *
 * ie:
 *
 * blueprints: {
 *  parent: {
 *      inherits: '_base'
 *      ,component1: {
 *          val1: 'value'
 *          ,val2: 'valParent'
 *      }
 *  },
 *  child: {
 *      inherits: 'parent'
 *      ,component1: {
 *          val3: 'val3'
 *          ,val2: 'valChild'  //will override parent!
 *      }
 *  }
 *
 * }
 *
 * generateInstanceBlueprint('child') will create:
 *
 * {
 *   inherits: 'child'
 *   id: 10293
 *   ,component1: {
 *      val1: 'value'
 *      ,val2: 'valChilde'
 *      ,val3: 'val3'
 *  }
 * }
 *
 * options: {
 *    ignoreCase: true -- don't try to match case when loading/searching fror blueprints
 *    requireInherits: true -- an inherits: 'value' must be present on each blueprint.  For the top level, specify: inherits: '_base'
 *  
 * }
 */

var BlueprintCatalog = function (opts) {
    "use strict";

    var defaults = {
        ignoreCase: true,
        requireInherits: true
    };

    var options = extendBlueprint(defaults, opts || {});

    var blueprintDictionary = new Dictionary({
        ignoreCase: options.ignoreCase
    });
    var hydratedBlueprints = new Dictionary({
        ignoreCase: options.ignoreCase
    });
    var bpList = [];
    var debugMode = false;

    var needsReindexing = false;

    /**
     * Clears the blueprints and resets everything
     *
     * @method clear
     */
    function clear() {
        blueprintDictionary.clear();
        hydratedBlueprints.clear();
        bpList = [];
        needsReindexing = false;
    }

    /**
     * loads a single blueprint into the dictionary.
     * progressCallback can optionally be provided as:
     *   function(blueprintName, true|false (loaded), msg)
     *
     * @method loadSingleBlueprint
     * @param {object} blueprint
     * @param {string} [blueprintName]
     * @param {function} [progressCallback] Callback with the signature  function(blueprintName, loaded (boolean), message, blueprint)
     */
    function loadSingleBlueprint(blueprint, blueprintName, progressCallback) {
        blueprint.name = blueprint.name || blueprintName;
        needsReindexing = true;

        if (options.requireInherits && typeof (blueprint.inherits) === 'undefined') {
            throw new Error('Blueprint does not provide an "inherits" property: ' + blueprint.name);
        }

        try {
            blueprintDictionary.add(blueprint.name, blueprint);
            if (progressCallback) {
                progressCallback(blueprint.name, true, 'Loaded blueprint: ' + blueprint.name, blueprint);
            }
        } catch (e) {
            if (progressCallback) {
                progressCallback(blueprint.name, false, e.message, blueprint);
            }
        }
    }

    /**
     * loads a block of blueprints into the dictionary.  They need to be in the format
     * {
     *   blueprintName: { blueprint details ... }
     *   blueptintName: { blueprint details ... }
     * }
     * progressCallback can optionally be provided as:
     *   function(blueprintName, true|false (loaded), msg)
     *
     * @method loadBlueprints
     * @param {object} block a block of blueprints to load with keys as the name of each blueprint
     * @param {function} [progressCallback] Callback with the signature  function(blueprintName, loaded (boolean), message, blueprint)
     */
    function loadBlueprints(block, progressCallback) {
        for (var blueprintName in block) {
            if (block.hasOwnProperty(blueprintName)) {
                loadSingleBlueprint(block[blueprintName], blueprintName, progressCallback);
            }
        }
    }

    /**
     * Will extend either a blueprint of a sub component of a blueprint, returning a new blueprint containing the combination.
     * The original blueprint will not be modified unless inPlaceExtend is set.
     *
     * @method extendBlueprint
     * @param orig original blueprint to extend
     * @param extendwith object to extend original blueprint with
     * @param {bool} [inPlaceExtend] if true, will modify the orig blueprint.  Defaults to false
     * @return {Object} New object that contains the merged values
     */
    function extendBlueprint(orig, extendwith, inPlaceExtend) {
        var result = inPlaceExtend ? orig : {};
        var i;

        for (i in orig) {
            if (orig.hasOwnProperty(i)) {
                result[i] = orig[i];
            }
        }
        for (i in extendwith) {
            if (extendwith.hasOwnProperty(i)) {

                if (typeof extendwith[i] === 'object') {
                    if (extendwith[i] === null) {
                        result[i] = null;
                    } else if (extendwith[i].length) {
                        //handle array types
                        result[i] = extendwith[i];
                    } else {
                        result[i] = extendBlueprint(result[i], extendwith[i]);
                    }
                } else {
                    result[i] = extendwith[i];
                }
            }
        }
        return result;
    }

    /**
     * will return a blueprint hydrating it with values from it's lineage, optionally extending it with
     * the blueprint provided with 'extendwith'
     *
     * @method getBlueprint
     * @param name the name of the blueprint to return.  Must already have been loaded into the library.
     * @param {object} [extendWith] Optionally extend the returned blueprint with this blueprint
     * @return {object} hydrated blueprint
     */
    function getBlueprint(name, extendWith) {
        var result;

        if (!hydratedBlueprints.containsKey(name)) {
            if (debugMode) {
                console.log('hydrating ' + name);
            }
            result = blueprintDictionary.get(name);

            if (typeof result.inherits === 'undefined' || result.inherits === '_base') {
                hydratedBlueprints.add(name, result);
            } else {
                try {
                    var hydrated = getBlueprint(result.inherits, result);
                    hydratedBlueprints.add(name, hydrated);
                    result = hydrated;
                } catch (e) {
                    throw new Error('Blueprint: "' + name + '" inherits from undefined blueprint: "' + result.inherits + '"');
                }
            }
        } else {
            result = hydratedBlueprints.get(name);
        }

        if (extendWith) {
            result = extendBlueprint(result, extendWith);
        }
        return result;
    }

    /**
     * returns the original (un-hydrated) version of the blueprint
     *
     * @method getOriginalBlueprint
     * @param name Name of the blueprint to return.  Must already have been loaded into the library
     * @return {object} un-hydrated blueprint
     */
    function getOriginalBlueprint(name) {
        return blueprintDictionary.get(name);
    }

    /**
     * returns an array of all blueprint names in the dictionary
     *
     * @method getAllBlueprintNames
     * @return {Array} array of all blueprint names
     */
    function getAllBlueprintNames() {
        return blueprintDictionary.getAllKeys();
    }

    /**
     * Gets a fully fleshed out blueprint from an instance structure.  The instance will not be cached
     * in the blueprint database
     *
     * @method getBlueprintFromInstance
     * @param {object} instance
     * @return {object}
     */
    function getBlueprintFromInstance(instance) {

        if (typeof instance.inherits === 'undefined' || instance.inherits === '_base') {
            return instance;
        } else {
            return getBlueprint(instance.inherits, instance);
        }
    }

    /**
     * returns all blueprints that inherit from the provided base blueprint.  If recurse is true
     * then it will walk down the entire tree, otherwise it will only return direct descendants
     *
     * @method getBlueprintDescendingFrom
     * @param {string} baseBlueprintName
     * @param {boolean} [recurse]
     * @return {Array} a list of all blueprints that descend from baseBlueprintName
     */
    function getBlueprintsDescendingFrom(baseBlueprintName, recurse) {
        var results = blueprintDictionary.find(function (item) {
            if (item.inherits === baseBlueprintName) {
                return true;
            }
        });

        if (recurse && results.length) {
            var newresults = [];
            for (var i = 0; i < results.length; i++) {
                newresults = newresults.concat(getBlueprintsDescendingFrom(results[i].name, recurse));
            }
            results = results.concat(newresults);
        }
        return results;
    }

    /**
     * will run through and hydrate all of the blueprints.  This will detect if there are any invalid ones
     * and also speed up queries
     *
     * @method hydrateAllBlueprints
     */
    function hydrateAllBlueprints() {
        getAllBlueprintNames().forEach(function (bp) {
            getBlueprint(bp);
        });
        needsReindexing = false;
    }

    /**
     * find a blueprint by providing a filter that will be called for each blueprint.
     * if limit is provided, it will stop iterating once the limit of found blueprints is met.
     *
     * @method find
     * @param {function} filt function to call with each blueprint to determine if it matches
     * @param {int} limit if provided, then limit the results to this amount
     * @return {Array} matches
     */
    function find(filt, limit) {
        if (needsReindexing) {
            hydrateAllBlueprints();
        }

        return hydratedBlueprints.find(filt, limit);
    }

    /**
     * @method hasBlueprint
     * @param {string} blueprintName Name of blueprint to check fo
     * @return {bool} true if the blueprint exists in the library
     */
    function hasBlueprint(blueprintName) {
        return blueprintDictionary.containsKey(blueprintName);
    }

    return {
        clear: clear,
        loadSingleBlueprint: loadSingleBlueprint,
        loadBlueprints: loadBlueprints,
        getBlueprint: getBlueprint,
        getBlueprintFromInstance: getBlueprintFromInstance,
        getBlueprintsDescendingFrom: getBlueprintsDescendingFrom,
        hydrateAllBlueprints: hydrateAllBlueprints,
        find: find,
        getAllBlueprintNames: getAllBlueprintNames,
        getOriginalBlueprint: getOriginalBlueprint,
        hasBlueprint: hasBlueprint,
        extendBlueprint: extendBlueprint

    };

};

module.exports = BlueprintCatalog;
