/**
 *
 * Created by shaddockh on 9/28/14.
 */

export interface DictionaryOptions {
    ignoreCase: boolean;
}

/**
 * Dictionary class.  Allows for creating a case-insensitive dictionary
 */
export default class Dictionary<T> {
    private _catalog: { [key: string]: T } = {};
    private _keys: string[] = [];
    private _ignoreCase = true;

    constructor(opts: DictionaryOptions = {
        ignoreCase: true
    }) {
        this._ignoreCase = opts.ignoreCase;
    }

    /**
     * Clears the catalog
     *
     * @method clear
     */
    clear() {
        this._catalog = {};

        // Note: according to JSPerf this is the fastest way to clear an array
        let k = this._keys;
        while (k.length > 0) {
            k.pop();
        }
    }

    /**
     * Return true if the dictionary contains the provided key
     * @param key
     * @returns {boolean|*}
     */
    containsKey(key: string): boolean {
        key = this._ignoreCase ? key.toUpperCase() : key;
        return this._catalog.hasOwnProperty(key);
    }

    /**
     * loads a single item into the dictionary with the provided key name.  Will throw an error if there is
     * already an item with this key in the catalog.
     *
     * @param key
     * @param item
     */
    add(key: string, item: T) {
        let newkey = this._ignoreCase ? key.toUpperCase() : key;

        if (typeof this._catalog[newkey] !== "undefined") {
            throw new Error("Duplicate item detected: " + key);
        } else {
            this._catalog[newkey] = item;
            this._keys.push(key);
        }
    }

    /**
     * loads a block of items into the dictionary.  They need to be in the format
     * {
     *   key: object,
     *   key: object
     * }
     *
     * @param block
     */
    addItems(block: Object) {
        for (let itemName in block) {
            this.add(itemName, block[itemName]);
        }
    };

    /**
     * returns an item specified by the key provided in the catalog
     * @param {string} key
     * @returns {*}
     */
    get(key: string): T {
        let newkey = this._ignoreCase ? key.toUpperCase() : key;
        if (!this._catalog.hasOwnProperty(newkey)) {
            throw new Error("Item does not exist in catalog: " + key);
        }
        return this._catalog[newkey];
    };

    /** @deprecated */
    getItem(key: string): T {
        console.error("Deprecated: Dictionary.getItem");
        return this.get(key);
    };

    /**
     * returns an array of all key names in the catalog
     * @returns {Array}
     */
    getAllKeys(): string[] {
        return this._keys.slice();
    };

    /**
     * iterates over the items in the catalog and executes callback for each element
     * @param callback format: function(item, key)
     */
    forEach(callback: (item: T, key: string) => void) {
        let dict = this;
        this._keys.forEach(function(key) {
            callback(dict.get(key), key);
        });
    };

    /**
     * find an item by providing a filter that will be called for each item.
     * if limit is provided, it will stop iterating once the limit of found items is met.
     *
     * @method find
     * @param {function} filt
     * @param {int} limit number of elements to limit result to
     * @return {Array} matches
     */
    find(filt: (item: T) => boolean, limit?: number): T[] {
        let results: T[] = [];
        if (typeof (filt) !== "function") {
            throw new Error(".find must be provided a function to use for filtering");
        }
        limit = limit || -1;
        let item: T;
        for (let key in this._catalog) {
            item = this._catalog[key];

            if (filt(item)) {
                results.push(item);
            }
        }
        return results;
    };
}
