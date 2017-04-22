(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dictionary_1 = require("./dictionary");
/**
 * Generic blueprint manager.  What this will do is allow you
 * to define a hierarchy of templates that descend from each other.
 * when creating a blueprint, it will walk up the entire tree of the
 * hierarchy and fill in any blank values that are provided at parent levels
 * and give you a fully hydrated blueprint.
 *
 * ie:
 * ``` json
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
 * ```
 * generateInstanceBlueprint('child') will create:
 *
 * ``` json
 * {
 *   inherits: 'child'
 *   id: 10293
 *   ,component1: {
 *      val1: 'value'
 *      ,val2: 'valChilde'
 *      ,val3: 'val3'
 *  }
 * ```
 */
var BlueprintCatalog = (function () {
    function BlueprintCatalog(opts) {
        if (opts === void 0) { opts = {
            ignoreCase: true,
            requireInherits: true
        }; }
        this.blueprintDictionary = null;
        this.hydratedBlueprints = null;
        this.debugMode = false;
        this.needsReindexing = false;
        this.options = null;
        this.options = opts;
        this.blueprintDictionary = new dictionary_1.Dictionary({
            ignoreCase: opts.ignoreCase
        });
        this.hydratedBlueprints = new dictionary_1.Dictionary({
            ignoreCase: opts.ignoreCase
        });
    }
    /**
     * Clears the blueprints and resets everything
     */
    BlueprintCatalog.prototype.clear = function () {
        this.blueprintDictionary.clear();
        this.hydratedBlueprints.clear();
        this.needsReindexing = false;
    };
    /**
     * loads a single blueprint into the dictionary.  If a callback is provided, it will be called when the blueprint is loaded
     */
    BlueprintCatalog.prototype.loadSingleBlueprint = function (blueprint, blueprintName, progressCallback) {
        blueprint.name = blueprint.name || blueprintName;
        this.needsReindexing = true;
        if (this.options.requireInherits && typeof (blueprint.inherits) === "undefined") {
            throw new Error("Blueprint does not provide an 'inherits' property: " + blueprint.name);
        }
        try {
            this.blueprintDictionary.add(blueprint.name, blueprint);
            if (progressCallback) {
                progressCallback(blueprint.name, true, "Loaded blueprint: " + blueprint.name, blueprint);
            }
        }
        catch (e) {
            if (progressCallback) {
                progressCallback(blueprint.name, false, e.message, blueprint);
            }
        }
    };
    /**
     * loads a block of blueprints into the dictionary.  They need to be in the format
     * ```
     * {
     *   blueprintName: { blueprint details ... }
     *   blueptintName: { blueprint details ... }
     * }
     *```
     * progressCallback can optionally be provided which will be called as each blueprint is loaded.
     * @param block a block of blueprints to load with keys as the name of each blueprint
     * @param progressCallback Callback with the signature  function(blueprintName, loaded (boolean), message, blueprint)
     */
    BlueprintCatalog.prototype.loadBlueprints = function (block, progressCallback) {
        for (var blueprintName in block) {
            if (block.hasOwnProperty(blueprintName)) {
                this.loadSingleBlueprint(block[blueprintName], blueprintName, progressCallback);
            }
        }
    };
    BlueprintCatalog.prototype.extendBlueprint = function (orig, extendwith, inPlaceExtend) {
        var result = inPlaceExtend ? orig : {};
        for (var i in orig) {
            if (orig.hasOwnProperty(i)) {
                result[i] = orig[i];
            }
        }
        for (var i in extendwith) {
            if (extendwith.hasOwnProperty(i)) {
                if (typeof extendwith[i] === "object") {
                    if (extendwith[i] === null) {
                        result[i] = null;
                    }
                    else if (extendwith[i].length) {
                        // handle array types
                        result[i] = extendwith[i];
                    }
                    else {
                        result[i] = this.extendBlueprint(result[i], extendwith[i]);
                    }
                }
                else {
                    result[i] = extendwith[i];
                }
            }
        }
        return result;
    };
    /**
     * will return a blueprint hydrating it with values from it's lineage, optionally extending it with
     * the blueprint provided with 'extendwith'
     *
     * @param name the name of the blueprint to return.  Must already have been loaded into the library.
     * @param extendWith Optionally extend the returned blueprint with this blueprint
     * @return hydrated blueprint
     */
    BlueprintCatalog.prototype.getBlueprint = function (name, extendWith) {
        var result;
        if (!this.hydratedBlueprints.containsKey(name)) {
            if (this.debugMode) {
                console.log("hydrating " + name);
            }
            result = this.blueprintDictionary.get(name);
            if (typeof result.inherits === "undefined" || result.inherits === "_base") {
                this.hydratedBlueprints.add(name, result);
            }
            else {
                try {
                    var hydrated = this.getBlueprint(result.inherits, result);
                    this.hydratedBlueprints.add(name, hydrated);
                    result = hydrated;
                }
                catch (e) {
                    throw new Error("Blueprint: '" + name + "' inherits from undefined blueprint: '" + result.inherits + "'");
                }
            }
        }
        else {
            result = this.hydratedBlueprints.get(name);
        }
        if (extendWith) {
            result = this.extendBlueprint(result, extendWith);
        }
        return result;
    };
    /**
     * returns the original (un-hydrated) version of the blueprint
     *
     * @param name Name of the blueprint to return.  Must already have been loaded into the library
     * @return un-hydrated blueprint
     */
    BlueprintCatalog.prototype.getOriginalBlueprint = function (name) {
        return this.blueprintDictionary.get(name);
    };
    /**
     * returns an array of all blueprint names in the dictionary
     *
     * @return array of all blueprint names
     */
    BlueprintCatalog.prototype.getAllBlueprintNames = function () {
        return this.blueprintDictionary.getAllKeys();
    };
    /**
     * Gets a fully fleshed out blueprint from an instance structure.  The instance will not be cached
     * in the blueprint database
     */
    BlueprintCatalog.prototype.getBlueprintFromInstance = function (instance) {
        if (typeof instance.inherits === "undefined" || instance.inherits === "_base") {
            return instance;
        }
        else {
            return this.getBlueprint(instance.inherits, instance);
        }
    };
    /**
     * returns all blueprints that inherit from the provided base blueprint.  If recurse is true
     * then it will walk down the entire tree, otherwise it will only return direct descendants
     *
     * @return a list of all blueprints that descend from baseBlueprintName
     */
    BlueprintCatalog.prototype.getBlueprintsDescendingFrom = function (baseBlueprintName, recurse) {
        var results = this.blueprintDictionary.find(function (item) {
            if (item.inherits === baseBlueprintName) {
                return true;
            }
        });
        if (recurse && results.length) {
            var newresults = [];
            for (var i = 0; i < results.length; i++) {
                newresults = newresults.concat(this.getBlueprintsDescendingFrom(results[i].name, recurse));
            }
            results = results.concat(newresults);
        }
        return results;
    };
    /**
     * will run through and hydrate all of the blueprints.  This will detect if there are any invalid ones
     * and also speed up queries
     */
    BlueprintCatalog.prototype.hydrateAllBlueprints = function () {
        var _this = this;
        this.getAllBlueprintNames().forEach(function (bp) {
            _this.getBlueprint(bp);
        });
        this.needsReindexing = false;
    };
    /**
     * find a blueprint by providing a filter that will be called for each blueprint.
     * if limit is provided, it will stop iterating once the limit of found blueprints is met.
     *
     * @param filt function to call with each blueprint to determine if it matches
     * @param limit if provided, then limit the results to this amount
     * @return matches
     */
    BlueprintCatalog.prototype.find = function (filt, limit) {
        if (this.needsReindexing) {
            this.hydrateAllBlueprints();
        }
        return this.hydratedBlueprints.find(filt, limit);
    };
    /**
     * @method hasBlueprint
     * @param blueprintName Name of blueprint to check fo
     * @return true if the blueprint exists in the library
     */
    BlueprintCatalog.prototype.hasBlueprint = function (blueprintName) {
        return this.blueprintDictionary.containsKey(blueprintName);
    };
    return BlueprintCatalog;
}());
exports.BlueprintCatalog = BlueprintCatalog;

},{"./dictionary":2}],2:[function(require,module,exports){
/**
 *
 * Created by shaddockh on 9/28/14.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Dictionary class.  Allows for creating a case-insensitive dictionary
 */
var Dictionary = (function () {
    function Dictionary(opts) {
        if (opts === void 0) { opts = {
            ignoreCase: true
        }; }
        this._catalog = {};
        this._keys = [];
        this._ignoreCase = true;
        this._ignoreCase = opts.ignoreCase;
    }
    /**
     * Clears the catalog
     */
    Dictionary.prototype.clear = function () {
        this._catalog = {};
        // Note: according to JSPerf this is the fastest way to clear an array
        var k = this._keys;
        while (k.length > 0) {
            k.pop();
        }
    };
    /**
     * Return true if the dictionary contains the provided key
     */
    Dictionary.prototype.containsKey = function (key) {
        key = this._ignoreCase ? key.toUpperCase() : key;
        return this._catalog.hasOwnProperty(key);
    };
    /**
     * loads a single item into the dictionary with the provided key name.  Will throw an error if there is
     * already an item with this key in the catalog.
     */
    Dictionary.prototype.add = function (key, item) {
        var newkey = this._ignoreCase ? key.toUpperCase() : key;
        if (typeof this._catalog[newkey] !== "undefined") {
            throw new Error("Duplicate item detected: " + key);
        }
        else {
            this._catalog[newkey] = item;
            this._keys.push(key);
        }
    };
    /**
     * loads a block of items into the dictionary.  They need to be in the format
     * ``` json
     * {
     *   key: object,
     *   key: object
     * }
     * ```
     */
    Dictionary.prototype.addItems = function (block) {
        for (var itemName in block) {
            this.add(itemName, block[itemName]);
        }
    };
    ;
    /**
     * returns an item specified by the key provided in the catalog
     */
    Dictionary.prototype.get = function (key) {
        var newkey = this._ignoreCase ? key.toUpperCase() : key;
        if (!this._catalog.hasOwnProperty(newkey)) {
            throw new Error("Item does not exist in catalog: " + key);
        }
        return this._catalog[newkey];
    };
    ;
    /** @deprecated */
    Dictionary.prototype.getItem = function (key) {
        console.error("Deprecated: Dictionary.getItem");
        return this.get(key);
    };
    ;
    /**
     * returns an array of all key names in the catalog
     */
    Dictionary.prototype.getAllKeys = function () {
        return this._keys.slice();
    };
    ;
    /**
     * iterates over the items in the catalog and executes callback for each element
     */
    Dictionary.prototype.forEach = function (callback) {
        var dict = this;
        this._keys.forEach(function (key) {
            callback(dict.get(key), key);
        });
    };
    ;
    /**
     * find an item by providing a filter that will be called for each item.
     * if limit is provided, it will stop iterating once the limit of found items is met.
     * @param filt a filter function that returns true for each element that should match the find
     * @param limit number of elements to limit result to
     * @example
     * ```
     *   const results = dict.find(el => el.active == true);
     * ```
     */
    Dictionary.prototype.find = function (filt, limit) {
        var results = [];
        if (typeof (filt) !== "function") {
            throw new Error(".find must be provided a function to use for filtering");
        }
        limit = limit || -1;
        var item;
        for (var key in this._catalog) {
            item = this._catalog[key];
            if (filt(item)) {
                results.push(item);
            }
        }
        return results;
    };
    ;
    return Dictionary;
}());
exports.Dictionary = Dictionary;

},{}],3:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./dictionary"));
__export(require("./blueprintCatalog"));
__export(require("./mixinCatalog"));

},{"./blueprintCatalog":1,"./dictionary":2,"./mixinCatalog":4}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dictionary_1 = require("./dictionary");
"use strict";
/**
 * mixin catalog
 */
var MixinCatalog = (function () {
    function MixinCatalog() {
        this.mixinDictionary = new dictionary_1.Dictionary({
            ignoreCase: true
        });
    }
    /**
     * Clears the mixin and resets everything
     */
    MixinCatalog.prototype.clear = function () {
        this.mixinDictionary.clear();
    };
    /**
     * loads a single mixin into the dictionary.
     */
    MixinCatalog.prototype.loadSingleMixin = function (mixin, progressCallback) {
        try {
            this.mixinDictionary.add(mixin.name, mixin);
            if (progressCallback) {
                progressCallback(mixin.name, true, "Loaded mixin: " + mixin.name);
            }
        }
        catch (e) {
            if (progressCallback) {
                progressCallback(mixin.name, false, e.message);
            }
        }
    };
    /**
     * loads a block of mixins into the dictionary.  They need to be in the format
     * ``` json
     * {
     *   mixinName: { mixin details ... }
     *   mixinName: { mixin details ... }
     * }
     * ```
     * @param block block of mixins
     * @param progressCallback function to be provided as callback with signature function(mixinName, bool loaded, message)
     */
    MixinCatalog.prototype.loadMixins = function (block, progressCallback) {
        for (var mixinName in block) {
            this.loadSingleMixin(block[mixinName], progressCallback);
        }
    };
    /**
     * will return a component by name
     * @param name name of the mixin to retrieve
     * @returns mixin object
     */
    MixinCatalog.prototype.getMixin = function (name) {
        return this.mixinDictionary.get(name);
    };
    /**
     * will return an array of mixin names
     */
    MixinCatalog.prototype.getAllMixinNames = function () {
        return this.mixinDictionary.getAllKeys();
    };
    /**
     * Return true if the mixin provided exists
     */
    MixinCatalog.prototype.hasMixin = function (mixinName) {
        return this.mixinDictionary.containsKey(mixinName);
    };
    return MixinCatalog;
}());
exports.MixinCatalog = MixinCatalog;
;

},{"./dictionary":2}]},{},[3]);
