"use strict";
var dictionary_1 = require("./dictionary");
"use strict";
/**
 * mixin catalog
 */
var MixinCatalog = (function () {
    function MixinCatalog() {
        this.mixinDictionary = new dictionary_1.default({
            ignoreCase: true
        });
    }
    /**
     * Clears the mixin and resets everything
     *
     * @method clear
     */
    MixinCatalog.prototype.clear = function () {
        this.mixinDictionary.clear();
    };
    /**
     * loads a single mixin into the dictionary.
     * progressCallback can optionally be provided as:
     *   function(mixinName, true|false (loaded), msg)
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
     * {
     *   mixinName: { mixin details ... }
     *   mixinName: { mixin details ... }
     * }
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
     * @returns Object mixin object
     */
    MixinCatalog.prototype.getMixin = function (name) {
        return this.mixinDictionary.get(name);
    };
    /**
     * will return an array of mixin names
     * @returns {Array}
     */
    MixinCatalog.prototype.getAllMixinNames = function () {
        return this.mixinDictionary.getAllKeys();
    };
    MixinCatalog.prototype.hasMixin = function (mixinName) {
        return this.mixinDictionary.containsKey(mixinName);
    };
    return MixinCatalog;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MixinCatalog;
;
