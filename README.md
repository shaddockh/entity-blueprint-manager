Entity Blueprint Manager
===============


Generic blueprint manager.  What this will do is allow you to define a heirarchy of templates that descend from each other.
When creating a blueprint, it will walk up the entire tree of the heirarchy and fill in any blank values that are provided at parent levels
and give you a fully hydrated blueprint.

ie:
```
blueprints: {
 parent: {
     inherits: '_base'
     ,component1: {
         val1: 'value'
         ,val2: 'valParent'
     }
 },
 child: {
     inherits: 'parent'
     ,component1: {
         val3: 'val3'
         ,val2: 'valChild'  //will override parent!
     }
 }

}

var BlueprintCatalog = require('blueprintCatalog');
var bpLib = new BlueprintCatalog();
bpLib.loadBlueprints(blueprints);
```

To get a blueprint:
```
bpLib.getBlueprint('child');
```

returns
```
{
  inherits: 'parent',
  component1: {
    val1: 'value',
    val2: 'valChild',
    val3: 'val3'
  }
}
```

CHANGES
====
2016-04-20
* Converted to TypeScript.
    * Breaking Changes: you now need to:
``` javascript
var BlueprintCatalog = require("entity-blueprint-manager/blueprintCatalog").default;
var Dictionary = require("entity-blueprint-manager/dictionary").default;
var MixinCatalog = require("entity-blueprint-manager/mixinCatalog").default;
```

or
```TypeScript
import BlueprintCatalog from "entity-blueprint-manager/blueprintCatalog";
import Dictionary from "entity-blueprint-manager/dictionary";
import MixinCatalog from "entity-blueprint-manager/mixinCatalog";
```
* modified the build process
    * to build: ```npm run build```
    * to test: ```npm test```

* a ```browserified``` bundle is now located in ```./dist/entity-blueprint-manager.js```

2014-10-20
---
* Added hasBlueprint(name) to blueprintCatalog
* Added hasMixin(name) to mixinCatalog

2015-07-10
---
* added an index.js that returns the different components so you can do: require('entity-blueprint-lib').blueprintCatalog;

2015-07-15
---
* exposed blueprintCatalog.extendBlueprint for use outside the library as a utility function.  
