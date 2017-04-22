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
