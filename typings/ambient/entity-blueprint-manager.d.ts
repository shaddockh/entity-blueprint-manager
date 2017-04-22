declare module 'entity-blueprint-manager' {
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
	export class Dictionary<T> {
	    private _catalog;
	    private _keys;
	    private _ignoreCase;
	    constructor(opts?: DictionaryOptions);
	    /**
	     * Clears the catalog
	     */
	    clear(): void;
	    /**
	     * Return true if the dictionary contains the provided key
	     */
	    containsKey(key: string): boolean;
	    /**
	     * loads a single item into the dictionary with the provided key name.  Will throw an error if there is
	     * already an item with this key in the catalog.
	     */
	    add(key: string, item: T): void;
	    /**
	     * loads a block of items into the dictionary.  They need to be in the format
	     * ``` json
	     * {
	     *   key: object,
	     *   key: object
	     * }
	     * ```
	     */
	    addItems(block: Object): void;
	    /**
	     * returns an item specified by the key provided in the catalog
	     */
	    get(key: string): T;
	    /** @deprecated */
	    getItem(key: string): T;
	    /**
	     * returns an array of all key names in the catalog
	     */
	    getAllKeys(): string[];
	    /**
	     * iterates over the items in the catalog and executes callback for each element
	     */
	    forEach(callback: (item: T, key: string) => void): void;
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
	    find(filt: (item: T) => boolean, limit?: number): T[];
	}

}
declare module 'entity-blueprint-manager' {
	export interface BlueprintCatalogOptions {
	    /**
	     * Don't try to match case when loading/searching for blueprints
	     */
	    ignoreCase: boolean;
	    /**
	     * An ```inherits: 'value'``` must be present on each blueprint.  For the top level, specify: ```inherits: '_base'```
	     */
	    requireInherits: boolean;
	}
	export interface Blueprint {
	    /**
	     * Name of the blueprint this blueprint inherits from
	     */
	    inherits?: string;
	    /**
	     * Name of the blueprint.
	     */
	    name?: string;
	    /**
	     * Components/Mixins attached to this blueprint and their settings
	     */
	    [key: string]: Object;
	}
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
	export class BlueprintCatalog {
	    constructor(opts?: BlueprintCatalogOptions);
	    private blueprintDictionary;
	    private hydratedBlueprints;
	    private debugMode;
	    private needsReindexing;
	    private options;
	    /**
	     * Clears the blueprints and resets everything
	     */
	    clear(): void;
	    /**
	     * loads a single blueprint into the dictionary.  If a callback is provided, it will be called when the blueprint is loaded
	     */
	    loadSingleBlueprint(blueprint: Blueprint, blueprintName: string, progressCallback: (blueprintName: string, error: boolean, message: string, blueprint: Blueprint) => void): void;
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
	    loadBlueprints(block: Object, progressCallback?: (blueprintName: string, error: boolean, message: string, blueprint: Blueprint) => void): void;
	    /**
	     * Will extend either a blueprint of a sub component of a blueprint, returning a new blueprint containing the combination.
	     * The original blueprint will not be modified unless inPlaceExtend is set.
	     *
	     * @param orig original blueprint to extend
	     * @param extendwith object to extend original blueprint with
	     * @param inPlaceExtend if true, will modify the orig blueprint.  Defaults to false
	     * @return New object that contains the merged values
	     */
	    extendBlueprint(orig: Object, extendwith: Object, inPlaceExtend?: boolean): Blueprint;
	    extendBlueprint(orig: Blueprint, extendwith: Blueprint, inPlaceExtend?: boolean): Blueprint;
	    /**
	     * will return a blueprint hydrating it with values from it's lineage, optionally extending it with
	     * the blueprint provided with 'extendwith'
	     *
	     * @param name the name of the blueprint to return.  Must already have been loaded into the library.
	     * @param extendWith Optionally extend the returned blueprint with this blueprint
	     * @return hydrated blueprint
	     */
	    getBlueprint(name: string, extendWith?: Blueprint): Blueprint;
	    /**
	     * returns the original (un-hydrated) version of the blueprint
	     *
	     * @param name Name of the blueprint to return.  Must already have been loaded into the library
	     * @return un-hydrated blueprint
	     */
	    getOriginalBlueprint(name: string): Blueprint;
	    /**
	     * returns an array of all blueprint names in the dictionary
	     *
	     * @return array of all blueprint names
	     */
	    getAllBlueprintNames(): string[];
	    /**
	     * Gets a fully fleshed out blueprint from an instance structure.  The instance will not be cached
	     * in the blueprint database
	     */
	    getBlueprintFromInstance(instance: Blueprint): Blueprint;
	    /**
	     * returns all blueprints that inherit from the provided base blueprint.  If recurse is true
	     * then it will walk down the entire tree, otherwise it will only return direct descendants
	     *
	     * @return a list of all blueprints that descend from baseBlueprintName
	     */
	    getBlueprintsDescendingFrom(baseBlueprintName: string, recurse: boolean): Blueprint[];
	    /**
	     * will run through and hydrate all of the blueprints.  This will detect if there are any invalid ones
	     * and also speed up queries
	     */
	    hydrateAllBlueprints(): void;
	    /**
	     * find a blueprint by providing a filter that will be called for each blueprint.
	     * if limit is provided, it will stop iterating once the limit of found blueprints is met.
	     *
	     * @param filt function to call with each blueprint to determine if it matches
	     * @param limit if provided, then limit the results to this amount
	     * @return matches
	     */
	    find(filt: (item: Blueprint) => boolean, limit?: number): Blueprint[];
	    /**
	     * @method hasBlueprint
	     * @param blueprintName Name of blueprint to check fo
	     * @return true if the blueprint exists in the library
	     */
	    hasBlueprint(blueprintName: string): boolean;
	}

}
declare module 'entity-blueprint-manager' {
	export interface Mixin {
	    name: string;
	}
	/**
	 * mixin catalog
	 */
	export class MixinCatalog {
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

}
