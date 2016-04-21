export interface BlueprintCatalogOptions {
    ignoreCase: boolean;
    requireInherits: boolean;
}
export default class BlueprintCatalog {
    constructor(opts?: BlueprintCatalogOptions);
    private blueprintDictionary;
    private hydratedBlueprints;
    private bpList;
    private debugMode;
    private needsReindexing;
    private options;
    /**
     * Clears the blueprints and resets everything
     *
     * @method clear
     */
    clear(): void;
    /**
     * loads a single blueprint into the dictionary.
     * progressCallback can optionally be provided as:
     *   function(blueprintName, true|false (loaded), msg)
     *
     * @method loadSingleBlueprint
     * @param {object} blueprint
     * @param {string} [blueprintName]
     * @param {function} [progressCallback] Callback with the signature  function(blueprintName, loaded (boolean), message, blueprint)
     */
    loadSingleBlueprint(blueprint: any, blueprintName: any, progressCallback: any): void;
    /**
     * loads a block of blueprints into the dictionary.  They need to be in the format
     * {
     *   blueprintName: { blueprint details ... }
     *   blueptintName: { blueprint details ... }
     * }
     * progressCallback can optionally be provided as:
     *   function(blueprintName, true|false (loaded), msg)
     *
     * @method loadBlueprints
     * @param {object} block a block of blueprints to load with keys as the name of each blueprint
     * @param {function} [progressCallback] Callback with the signature  function(blueprintName, loaded (boolean), message, blueprint)
     */
    loadBlueprints(block: any, progressCallback: any): void;
    /**
     * Will extend either a blueprint of a sub component of a blueprint, returning a new blueprint containing the combination.
     * The original blueprint will not be modified unless inPlaceExtend is set.
     *
     * @method extendBlueprint
     * @param orig original blueprint to extend
     * @param extendwith object to extend original blueprint with
     * @param {bool} [inPlaceExtend] if true, will modify the orig blueprint.  Defaults to false
     * @return {Object} New object that contains the merged values
     */
    extendBlueprint(orig: any, extendwith: any, inPlaceExtend?: any): any;
    /**
     * will return a blueprint hydrating it with values from it's lineage, optionally extending it with
     * the blueprint provided with 'extendwith'
     *
     * @method getBlueprint
     * @param name the name of the blueprint to return.  Must already have been loaded into the library.
     * @param {object} [extendWith] Optionally extend the returned blueprint with this blueprint
     * @return {object} hydrated blueprint
     */
    getBlueprint(name: any, extendWith?: any): any;
    /**
     * returns the original (un-hydrated) version of the blueprint
     *
     * @method getOriginalBlueprint
     * @param name Name of the blueprint to return.  Must already have been loaded into the library
     * @return {object} un-hydrated blueprint
     */
    getOriginalBlueprint(name: any): any;
    /**
     * returns an array of all blueprint names in the dictionary
     *
     * @method getAllBlueprintNames
     * @return {Array} array of all blueprint names
     */
    getAllBlueprintNames(): any[];
    /**
     * Gets a fully fleshed out blueprint from an instance structure.  The instance will not be cached
     * in the blueprint database
     *
     * @method getBlueprintFromInstance
     * @param {object} instance
     * @return {object}
     */
    getBlueprintFromInstance(instance: any): any;
    /**
     * returns all blueprints that inherit from the provided base blueprint.  If recurse is true
     * then it will walk down the entire tree, otherwise it will only return direct descendants
     *
     * @method getBlueprintDescendingFrom
     * @param {string} baseBlueprintName
     * @param {boolean} [recurse]
     * @return {Array} a list of all blueprints that descend from baseBlueprintName
     */
    getBlueprintsDescendingFrom(baseBlueprintName: any, recurse: any): any[];
    /**
     * will run through and hydrate all of the blueprints.  This will detect if there are any invalid ones
     * and also speed up queries
     *
     * @method hydrateAllBlueprints
     */
    hydrateAllBlueprints(): void;
    /**
     * find a blueprint by providing a filter that will be called for each blueprint.
     * if limit is provided, it will stop iterating once the limit of found blueprints is met.
     *
     * @method find
     * @param {function} filt function to call with each blueprint to determine if it matches
     * @param {int} limit if provided, then limit the results to this amount
     * @return {Array} matches
     */
    find(filt: any, limit: any): any[];
    /**
     * @method hasBlueprint
     * @param {string} blueprintName Name of blueprint to check fo
     * @return {bool} true if the blueprint exists in the library
     */
    hasBlueprint(blueprintName: any): boolean;
}
