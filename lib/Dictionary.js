/**
 *
 * Created by shaddockh on 9/28/14.
 */

function Dictionary(opts) {
  this._catalog = {};
  this._keys = [];
  opts = opts || {};
  if (typeof (opts.ignoreCase) === 'undefined') {
    this._ignoreCase = true;
  } else {
    this._ignoreCase = opts.ignoreCase || true;
  }
}

/**
 * Clears the catalog
 *
 * @method clear
 */
Dictionary.prototype.clear = function () {
  this._catalog = {};

  //Note: according to JSPerf this is the fastest way to clear an array
  var k = this._keys;
  while (k.length > 0) {
    k.pop();
  }
};

/**
 * Return true if the dictionary contains the provided key
 * @param key
 * @returns {boolean|*}
 */
Dictionary.prototype.containsKey = function (key) {
  key = this._ignoreCase ? key.toUpperCase() : key;
  return this._catalog.hasOwnProperty(key);
};

/**
 * loads a single item into the dictionary with the provided key name.  Will throw an error if there is
 * already an item with this key in the catalog.
 *
 * @param key
 * @param item
 */
Dictionary.prototype.add = function (key, item) {
  var newkey = this._ignoreCase ? key.toUpperCase() : key;

  if (typeof this._catalog[newkey] !== 'undefined') {
    throw new Error('Duplicate item detected: ' + key);
  } else {
    this._catalog[newkey] = item;
    this._keys.push(key);
  }
};

/**
 * loads a block of items into the dictionary.  They need to be in the format
 * {
 *   key: object,
 *   key: object
 * }
 *
 * @param block
 */
Dictionary.prototype.addItems = function (block) {
  for (var itemName in block) {
    this.add(itemName, block);
  }
};

/**
 * returns an item specified by the key provided in the catalog
 * @param key
 * @returns {*}
 */
Dictionary.prototype.getItem = function (key) {
  var newkey = this._ignoreCase ? key.toUpperCase() : key;
  if (!this._catalog.hasOwnProperty(newkey)) {
    throw new Error('Item does not exist in catalog: ' + key);
  }
  return this._catalog[newkey];
};

/**
 * returns an array of all key names in the catalog
 * @returns {Array}
 */
Dictionary.prototype.getAllKeys = function () {
  return this._keys.splice(0);
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
Dictionary.prototype.find = function (filt, limit) {
  var results = [];
  if (typeof (filt) !== 'function') {
    throw new Error('.find must be provided a function to use for filtering');
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

module.exports = Dictionary;
