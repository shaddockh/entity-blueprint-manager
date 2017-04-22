import {Dictionary} from "./dictionary";


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
    [key:string]:Object;
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

    constructor(opts: BlueprintCatalogOptions = {
        ignoreCase: true,
        requireInherits: true
    }) {
        this.options = opts;
        this.blueprintDictionary = new Dictionary<Blueprint>({
            ignoreCase: opts.ignoreCase
        });

        this.hydratedBlueprints = new Dictionary<Blueprint>({
            ignoreCase: opts.ignoreCase
        });
    }

    private blueprintDictionary: Dictionary<Blueprint> = null;
    private hydratedBlueprints: Dictionary<Blueprint> = null;
    private debugMode = false;
    private needsReindexing = false;
    private options: BlueprintCatalogOptions = null;

    /**
     * Clears the blueprints and resets everything
     */
    clear() {
        this.blueprintDictionary.clear();
        this.hydratedBlueprints.clear();
        this.needsReindexing = false;
    }

    /**
     * loads a single blueprint into the dictionary.  If a callback is provided, it will be called when the blueprint is loaded
     */
    loadSingleBlueprint(blueprint: Blueprint, blueprintName: string, progressCallback: (blueprintName: string, error: boolean, message: string, blueprint: Blueprint) => void) {
        blueprint.name = blueprint.name || blueprintName;
        this.needsReindexing = true;

        if (this.options.requireInherits && typeof (blueprint.inherits) === "undefined") {
            throw new Error("Blueprint does not provide an 'inherits' property: " + blueprint.name);
        }

        try {
            this.blueprintDictionary.add(blueprint.name, blueprint);
            if (progressCallback) {
                progressCallback(blueprint.name, true, "Loaded blueprint: " + blueprint.name, blueprint);
            }
        } catch (e) {
            if (progressCallback) {
                progressCallback(blueprint.name, false, e.message, blueprint);
            }
        }
    }

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
    loadBlueprints(block: Object, progressCallback?: (blueprintName: string, error: boolean, message: string, blueprint: Blueprint) => void) {
        for (let blueprintName in block) {
            if (block.hasOwnProperty(blueprintName)) {
                this.loadSingleBlueprint(block[blueprintName], blueprintName, progressCallback);
            }
        }
    }

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
    extendBlueprint(orig: any, extendwith: Blueprint, inPlaceExtend?: boolean): Blueprint {
        let result = inPlaceExtend ? orig : {};

        for (let i in orig) {
            if (orig.hasOwnProperty(i)) {
                result[i] = orig[i];
            }
        }
        for (let i in extendwith) {
            if (extendwith.hasOwnProperty(i)) {

                if (typeof extendwith[i] === "object") {
                    if (extendwith[i] === null) {
                        result[i] = null;
                    } else if ((<any[]>extendwith[i]).length) {
                        // handle array types
                        result[i] = extendwith[i];
                    } else {
                        result[i] = this.extendBlueprint(result[i], extendwith[i]);
                    }
                } else {
                    result[i] = extendwith[i];
                }
            }
        }
        return result;
    }

    /**
     * will return a blueprint hydrating it with values from it's lineage, optionally extending it with
     * the blueprint provided with 'extendwith'
     *
     * @param name the name of the blueprint to return.  Must already have been loaded into the library.
     * @param extendWith Optionally extend the returned blueprint with this blueprint
     * @return hydrated blueprint
     */
    getBlueprint(name: string, extendWith?: Blueprint): Blueprint {
        let result: Blueprint;

        if (!this.hydratedBlueprints.containsKey(name)) {
            if (this.debugMode) {
                console.log("hydrating " + name);
            }
            result = this.blueprintDictionary.get(name);

            if (typeof result.inherits === "undefined" || result.inherits === "_base") {
                this.hydratedBlueprints.add(name, result);
            } else {
                try {
                    let hydrated = this.getBlueprint(result.inherits, result);
                    this.hydratedBlueprints.add(name, hydrated);
                    result = hydrated;
                } catch (e) {
                    throw new Error("Blueprint: '" + name + "' inherits from undefined blueprint: '" + result.inherits + "'");
                }
            }
        } else {
            result = this.hydratedBlueprints.get(name);
        }

        if (extendWith) {
            result = this.extendBlueprint(result, extendWith);
        }
        return result;
    }

    /**
     * returns the original (un-hydrated) version of the blueprint
     *
     * @param name Name of the blueprint to return.  Must already have been loaded into the library
     * @return un-hydrated blueprint
     */
    getOriginalBlueprint(name: string): Blueprint {
        return this.blueprintDictionary.get(name);
    }

    /**
     * returns an array of all blueprint names in the dictionary
     *
     * @return array of all blueprint names
     */
    getAllBlueprintNames(): string[] {
        return this.blueprintDictionary.getAllKeys();
    }

    /**
     * Gets a fully fleshed out blueprint from an instance structure.  The instance will not be cached
     * in the blueprint database
     */
    getBlueprintFromInstance(instance: Blueprint): Blueprint {

        if (typeof instance.inherits === "undefined" || instance.inherits === "_base") {
            return instance;
        } else {
            return this.getBlueprint(instance.inherits, instance);
        }
    }

    /**
     * returns all blueprints that inherit from the provided base blueprint.  If recurse is true
     * then it will walk down the entire tree, otherwise it will only return direct descendants
     *
     * @return a list of all blueprints that descend from baseBlueprintName
     */
    getBlueprintsDescendingFrom(baseBlueprintName: string, recurse: boolean): Blueprint[] {
        let results = this.blueprintDictionary.find(function(item) {
            if (item.inherits === baseBlueprintName) {
                return true;
            }
        });

        if (recurse && results.length) {
            let newresults: Blueprint[] = [];
            for (let i = 0; i < results.length; i++) {
                newresults = newresults.concat(this.getBlueprintsDescendingFrom(results[i].name, recurse));
            }
            results = results.concat(newresults);
        }
        return results;
    }

    /**
     * will run through and hydrate all of the blueprints.  This will detect if there are any invalid ones
     * and also speed up queries
     */
    hydrateAllBlueprints() {
        this.getAllBlueprintNames().forEach((bp) => {
            this.getBlueprint(bp);
        });
        this.needsReindexing = false;
    }

    /**
     * find a blueprint by providing a filter that will be called for each blueprint.
     * if limit is provided, it will stop iterating once the limit of found blueprints is met.
     *
     * @param filt function to call with each blueprint to determine if it matches
     * @param limit if provided, then limit the results to this amount
     * @return matches
     */
    find(filt: (item: Blueprint) => boolean, limit?: number): Blueprint[] {
        if (this.needsReindexing) {
            this.hydrateAllBlueprints();
        }

        return this.hydratedBlueprints.find(filt, limit);
    }

    /**
     * @method hasBlueprint
     * @param blueprintName Name of blueprint to check fo
     * @return true if the blueprint exists in the library
     */
    hasBlueprint(blueprintName: string): boolean {
        return this.blueprintDictionary.containsKey(blueprintName);
    }
}
