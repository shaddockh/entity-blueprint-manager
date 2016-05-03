import {Dictionary} from "./dictionary";

"use strict";

export interface Mixin {
    name: string;
}

/**
 * mixin catalog
 */
export class MixinCatalog {

  private mixinDictionary = new Dictionary<Mixin>({
    ignoreCase: true
  });

  /**
   * Clears the mixin and resets everything
   */
  clear() {
    this.mixinDictionary.clear();
  }

  /**
   * loads a single mixin into the dictionary.
   */
  loadSingleMixin(mixin: Mixin, progressCallback: (mixinName: string, loaded: boolean, msg: string) => void) {
    try {
      this.mixinDictionary.add(mixin.name, mixin);
      if (progressCallback) {
        progressCallback(mixin.name, true, "Loaded mixin: " + mixin.name);
      }
    } catch (e) {
      if (progressCallback) {
        progressCallback(mixin.name, false, e.message);
      }
    }
  }

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
  loadMixins(block: Object, progressCallback: (mixinName: string, loaded: boolean, message: string) => void) {
    for (let mixinName in block) {
      this.loadSingleMixin(block[mixinName], progressCallback);
    }
  }

  /**
   * will return a component by name
   * @param name name of the mixin to retrieve
   * @returns mixin object
   */
  getMixin(name: string): Mixin {
    return this.mixinDictionary.get(name);
  }

  /**
   * will return an array of mixin names
   */
  getAllMixinNames(): string[] {
    return this.mixinDictionary.getAllKeys();
  }

  /**
   * Return true if the mixin provided exists
   */
  hasMixin(mixinName: string): boolean {
    return this.mixinDictionary.containsKey(mixinName);
  }

};
