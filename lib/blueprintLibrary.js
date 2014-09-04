/**
 * Generic blueprint manager.  What this will do is allow you
 * to define a heirarchy of templates that descend from each other.
 * when creating a blueprint, it will walk up the entire tree of the
 * heirarchy and fill in any blank values that are provided at parent levels
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
 */

"use strict";

var blueprintDictionary = {};
var hydratedBlueprints = {};
var bpList = [];
var debugMode = false;

var needsReindexing = false;

/**
 * Clears the blueprints and resets everything
 *
 * @method clear
 */
function clear() {
  blueprintDictionary = {};
  hydratedBlueprints = {};
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
 * @param {function} progressCallback Callback with the signature  function(blueprintName, loaded (boolean), message)
 */
function loadSingleBlueprint(blueprint, blueprintName, progressCallback) {
  blueprint.name = blueprint.name || blueprintName;
  needsReindexing = true;

  if (typeof (blueprint.inherits) === 'undefined') {
    throw new Error('Blueprint does not provide an "inherits" property: ' + blueprint.name);
  }

  if (typeof blueprintDictionary[blueprint.name] !== 'undefined') {
    if (progressCallback) {
      progressCallback(blueprint.name, false, 'Duplicate blueprint detected: ' + blueprint.name);
    }
  } else {
    blueprintDictionary[blueprint.name] = blueprint;
    if (progressCallback) {
      progressCallback(blueprint.name, true, 'Loaded blueprint: ' + blueprint.name);
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
 * @param {function} [progressCallback] optional callback of the form  function(blueprintName, loaded (boolean), message)
 */
function loadBlueprints(block, progressCallback) {
  for (var blueprintName in block) {
    if (block.hasOwnProperty(blueprintName)) {
      loadSingleBlueprint(block[blueprintName], blueprintName, progressCallback);
    }
  }
}

/**
 * Will extend either a blueprint of a sub component of a blueprint.
 *
 * @method extend
 * @private
 * @param orig
 * @param extendwith
 * @return {Object} New object that contains the merged values
 */
function extend(orig, extendwith) {
  var result = {};
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
          result[i] = extend(result[i], extendwith[i]);
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

  result = hydratedBlueprints[name];
  if (typeof result === 'undefined') {
    if (debugMode) {
      console.log('hydrating ' + name);
    }
    result = blueprintDictionary[name];
    if (typeof result === 'undefined') {
      throw new Error('Undefined blueprint: ' + name);
    }

    if (typeof result.inherits === 'undefined' || result.inherits === '_base') {
      hydratedBlueprints[name] = result;
    } else {
      try {
        var hydrated = getBlueprint(result.inherits, result);
        hydratedBlueprints[name] = hydrated;
        result = hydrated;
      } catch (e) {
        throw new Error(name + ' inherits from undefined blueprint: ' + result.inherits);
      }
    }
  }

  if (extendWith) {
    result = extend(result, extendWith);
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
  return blueprintDictionary[name];
}

/**
 * returns an array of all blueprint names in the dictionary
 *
 * @method getAllBlueprintNames
 * @return {array} array of all blueprint names
 */
function getAllBlueprintNames() {
  var result = [];
  for (var name in blueprintDictionary) {
    if (blueprintDictionary.hasOwnProperty(name)) {
      result.push(name);
    }
  }
  return result;
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
 * then it will walk down the entire tree, otherwise it will only return direct descendents
 *
 * @method getBlueprintDescendingFrom
 * @param {string} baseBlueprintName
 * @param {boolean} recurse
 * @return {array} a list of all blueprints that descend from baseBlueprintName
 */
function getBlueprintsDescendingFrom(baseBlueprintName, recurse) {
  var results = [];
  for (var bpkey in blueprintDictionary) {
    if (blueprintDictionary.hasOwnProperty(bpkey)) {
      var bp = blueprintDictionary[bpkey];
      if (bp.inherits === baseBlueprintName) {
        results.push(bp);
        if (recurse) {
          results = results.concat(getBlueprintsDescendingFrom(bp.name, recurse));
        }
      }
    }
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
  bpList = [];
  for (var bp in blueprintDictionary) {
    if (blueprintDictionary.hasOwnProperty(bp)) {
      bpList.push(getBlueprint(bp));
    }
  }
  needsReindexing = false;
}

/**
 * find a blueprint by providing a filter that will be called for each blueprint.
 * if limit is provided, it will stop iterating once the limit of found blueprints is met.
 *
 * @method find
 * @param {function} filt
 * @param {int} limit
 * @return {array} matches
 */
function find(filt, limit) {
  if (needsReindexing) {
    hydrateAllBlueprints();
  }
  //todo

  var results = [];
  if (typeof (filt) !== 'function') {
    throw new Error('filt must be a Function');
  }

  for (var i = 0, iLen = bpList.length, item = null; i < iLen; i++) {
    item = bpList[i];
    if (filt(item)) {
      results.push(item);
      if (limit === results.length) {
        break;
      }
    }
  }
  return results;
}

var blueprintLibrary = {
  clear: clear,
  loadSingleBlueprint: loadSingleBlueprint,
  loadBlueprints: loadBlueprints,
  getBlueprint: getBlueprint,
  getBlueprintFromInstance: getBlueprintFromInstance,
  getBlueprintsDescendingFrom: getBlueprintsDescendingFrom,
  hydrateAllBlueprints: hydrateAllBlueprints,
  find: find,
  getAllBlueprintNames: getAllBlueprintNames,
  getOriginalBlueprint: getOriginalBlueprint
};

module.exports = blueprintLibrary;
