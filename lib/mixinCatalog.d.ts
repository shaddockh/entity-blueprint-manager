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
     */
    clear(): void;
    /**
     * loads a single mixin into the dictionary.
     */
    loadSingleMixin(mixin: Mixin, progressCallback: (mixinName: string, loaded: boolean, msg: string) => void): void;
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
    loadMixins(block: Object, progressCallback: (mixinName: string, loaded: boolean, message: string) => void): void;
    /**
     * will return a component by name
     * @param name name of the mixin to retrieve
     * @returns mixin object
     */
    getMixin(name: string): Mixin;
    /**
     * will return an array of mixin names
     */
    getAllMixinNames(): string[];
    /**
     * Return true if the mixin provided exists
     */
    hasMixin(mixinName: string): boolean;
}
