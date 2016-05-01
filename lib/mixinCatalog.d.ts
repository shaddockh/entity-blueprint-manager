export interface Mixin {
    name: string;
}
/**
 * mixin catalog
 */
export declare class MixinCatalog {
    private mixinDictionary;
    /**
     * Clears the mixin and resets everything
     *
     * @method clear
     */
    clear(): void;
    /**
     * loads a single mixin into the dictionary.
     * progressCallback can optionally be provided as:
     *   function(mixinName, true|false (loaded), msg)
     */
    loadSingleMixin(mixin: Mixin, progressCallback: (mixinName: string, loaded: boolean, msg: string) => void): void;
    /**
     * loads a block of mixins into the dictionary.  They need to be in the format
     * {
     *   mixinName: { mixin details ... }
     *   mixinName: { mixin details ... }
     * }
     * @param block block of mixins
     * @param progressCallback function to be provided as callback with signature function(mixinName, bool loaded, message)
     */
    loadMixins(block: Object, progressCallback: (mixinName: string, loaded: boolean, message: string) => void): void;
    /**
     * will return a component by name
     * @param name name of the mixin to retrieve
     * @returns Object mixin object
     */
    getMixin(name: string): Mixin;
    /**
     * will return an array of mixin names
     * @returns {Array}
     */
    getAllMixinNames(): string[];
    hasMixin(mixinName: string): boolean;
}
