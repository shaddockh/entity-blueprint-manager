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
export declare class Dictionary<T> {
    private _catalog;
    private _keys;
    private _ignoreCase;
    constructor(opts?: DictionaryOptions);
    /**
     * Clears the catalog
     *
     * @method clear
     */
    clear(): void;
    /**
     * Return true if the dictionary contains the provided key
     * @param key
     * @returns {boolean|*}
     */
    containsKey(key: string): boolean;
    /**
     * loads a single item into the dictionary with the provided key name.  Will throw an error if there is
     * already an item with this key in the catalog.
     *
     * @param key
     * @param item
     */
    add(key: string, item: T): void;
    /**
     * loads a block of items into the dictionary.  They need to be in the format
     * {
     *   key: object,
     *   key: object
     * }
     *
     * @param block
     */
    addItems(block: Object): void;
    /**
     * returns an item specified by the key provided in the catalog
     * @param {string} key
     * @returns {*}
     */
    get(key: string): T;
    /** @deprecated */
    getItem(key: string): T;
    /**
     * returns an array of all key names in the catalog
     * @returns {Array}
     */
    getAllKeys(): string[];
    /**
     * iterates over the items in the catalog and executes callback for each element
     * @param callback format: function(item, key)
     */
    forEach(callback: (item: T, key: string) => void): void;
    /**
     * find an item by providing a filter that will be called for each item.
     * if limit is provided, it will stop iterating once the limit of found items is met.
     *
     * @method find
     * @param {function} filt
     * @param {int} limit number of elements to limit result to
     * @return {Array} matches
     */
    find(filt: (item: T) => boolean, limit?: number): T[];
}
