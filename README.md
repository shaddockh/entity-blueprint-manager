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

var bpLib = require('blueprintLibrary');
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
 
