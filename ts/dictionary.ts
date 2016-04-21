/**
 *
 * Created by shaddockh on 9/28/14.
 */

/**
 * Dictionary class.  Allows for creating a case-insensitive dictionary 
 */
export default class Dictionary {
  private _catalog = {};
  private _keys = [];
  private _ignoreCase = true;

  constructor(opts = {
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
  containsKey(key) {
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
  add(key, item) {
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
  addItems(block) {
    for (let itemName in block) {
      this.add(itemName, block);
    }
  };

  /**
   * returns an item specified by the key provided in the catalog
   * @param key
   * @returns {*}
   */
  get(key) {
    let newkey = this._ignoreCase ? key.toUpperCase() : key;
    if (!this._catalog.hasOwnProperty(newkey)) {
      throw new Error("Item does not exist in catalog: " + key);
    }
    return this._catalog[newkey];
  };

  getItem(key) {
    console.error("Deprecated: Dictionary.getItem");
    return this.get(key);
  };

  /**
   * returns an array of all key names in the catalog
   * @returns {Array}
   */
  getAllKeys() {
    return this._keys.slice();
  };

  /**
   * iterates over the items in the catalog and executes callback for each element
   * @param callback format: function(item, key)
   */
  forEach(callback) {
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
   * @param {int} limit
   * @return {Array} matches
   */
  find(filt, limit?) {
    let results = [];
    if (typeof (filt) !== "function") {
      throw new Error(".find must be provided a function to use for filtering");
    }
    limit = limit || -1;
    let item;
    for (let key in this._catalog) {
      item = this._catalog[key];

      if (filt(item)) {
        results.push(item);

      }
    }
    return results;
  };
}
