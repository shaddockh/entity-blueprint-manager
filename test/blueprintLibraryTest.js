/**
 * Created by shaddockh on 9/14/13.
 */

/* global: describe, it, suite, test, setup */

var assert = require('chai').assert;
var blueprintLibrary = require('lib/blueprintLibrary');

/*
 * blueprint library
 */
suite("module: blueprintLibrary", function () {
  setup(function () {
    blueprintLibrary.clear();

    /* seed with some blueprints */

    var block = {
      grandparent: {
        inherits: '_base'
      },
      parent: {
        inherits: 'grandparent',
        component1: {
          prop1: 'test',
          overrideProp: 'parent'
        }
      },
      child: {
        inherits: 'parent',
        component1: {
          addlProp: 'addl',
          overrideProp: 'child'
        },
        component2: {
          prop1: 'rest'
        }
      },
      child2: {
        inherits: 'parent',
        component1: {
          addlProp: 'addl2',
          overrideProp: 'child2'
        },
        component2: {
          prop1: 'rest2'
        }
      }
    };
    blueprintLibrary.loadBlueprints(block);

  });

  test('should be able to load', function () {
    //var blueprintLibrary = require('core/blueprintLibrary');
    assert.isDefined(blueprintLibrary);
  });

  suite('.clear', function () {
    test('clears out library', function () {

      assert.notEqual(0, blueprintLibrary.getAllBlueprintNames().length);

      blueprintLibrary.clear();
      assert.equal(0, blueprintLibrary.getAllBlueprintNames().length);

    });

  });

  /*
   * .loadSingleBlueprint tests
   */
  suite('.loadSingleBlueprint', function () {

    test('throws an error if there is no inherit property', function () {
      var bp = {
        component: {
          myc: 'p'
        }
      };
      assert.
      throw (function () {
        blueprintLibrary.loadSingleBlueprint(bp);
      }, 'Blueprint does not provide an "inherits" property');
    });
    test('can load a aingle blueprint', function () {
      var bp = {
        inherits: '_base',
        component: {
          prop1: 'prop'
        }
      };
      blueprintLibrary.loadSingleBlueprint(bp, 'testBP');

      var result = blueprintLibrary.getBlueprint('testBP');
      assert.isDefined(result);
      assert.equal('prop', result.component.prop1);

    });
    test('load single blueprint with name attached should not throw error', function () {
      var bp = {
        inherits: '_base',
        name: 'testBP',
        component: {
          prop1: 'prop'
        }
      };
      blueprintLibrary.loadSingleBlueprint(bp);

      var result = blueprintLibrary.getBlueprint('testBP');
      assert.isDefined(result);
      assert.equal('prop', result.component.prop1);
    });

    test('load single blueprint should throw an error if loading a duplicate blueprint and dupe checking is turned on.');

    test('load single blueprint should not throw an error if loading a blueprint with inherits value that does not exist in library', function () {
      var bp = {
        inherits: 'unknown',
        name: 'testBp',
      };
      var testFunc = function () {
        blueprintLibrary.loadSingleBlueprint(bp);
      };
      assert.doesNotThrow(testFunc);
    });
  });

  /*
   * .loadBlueprints tests
   */
  suite('.loadBlueprints', function () {
    test('can load a blueprint block', function () {
      var block = {
        bp: {
          inherits: '_base',
          component: {
            prop1: 'prop'
          }
        }
      };
      blueprintLibrary.loadBlueprints(block);

      var result = blueprintLibrary.getBlueprint('bp');
      assert.isDefined(result);
      assert.equal('prop', result.component.prop1);
    });
    test('should not allow duplicate blueprints', function () {
      var block = {
        bp: {
          inherits: '_base',
          component: {
            prop1: 'prop'
          }
        }
      };
      blueprintLibrary.loadBlueprints(block);
      blueprintLibrary.loadBlueprints(block);

      var result = blueprintLibrary.getBlueprint('bp');
      assert.isDefined(result);
      assert.equal('prop', result.component.prop1);
    });
  });

  /*
   * .getBlueprint test
   */
  suite('.getBlueprint', function () {

    test('should return a hydrated blueprint', function () {
      var bp = blueprintLibrary.getBlueprint('child');
      assert.equal('test', bp.component1.prop1);
    });

    test('hydrated blueprint should add properties to base blueprint', function () {
      var bp = blueprintLibrary.getBlueprint('child');
      assert.equal('addl', bp.component1.addlProp);
      assert.isDefined(bp.component2);
    });

    test('hydrated blueprint should override properties in base blueprint', function () {
      var bp = blueprintLibrary.getBlueprint('child');
      assert.equal('child', bp.component1.overrideProp);
    });

    test('should extend a bluprint with provided template', function () {
      var overridebp = {
        component3: {
          newProp: 'newprop'
        }
      };
      var bp = blueprintLibrary.getBlueprint('child', overridebp);
      assert.isDefined(bp.component3);
      assert.equal('newprop', bp.component3.newProp);
    });

    test('should throw an error if trying to hydrate a blueprint that has an inherits value that does not exist in the library', function () {
      var bp = {
        inherits: 'not-added',
        name: 'testBp',
      };
      blueprintLibrary.loadSingleBlueprint(bp);

      var testFunc = function () {
        blueprintLibrary.getBlueprint('testBp');
      };
      assert.throws(testFunc, /testBp inherits from undefined blueprint: not-added/);
    });

    test('should throw an error if trying to get a blueprint that does not exist', function () {
      var testFunc = function () {
        blueprintLibrary.getBlueprint('not-exist');
      };
      assert.throws(testFunc, /Undefined blueprint: not-exist/);
    });
  });

  /*
   * .getAllBlueprintNames tests
   */
  suite('.getAllBlueprintNames', function () {

    test('should list all blueprint names', function () {
      assert.deepEqual(['grandparent', 'parent', 'child', 'child2'], blueprintLibrary.getAllBlueprintNames());
    });

  });

  /*
   * .getBlueprintFromInstance tests
   */
  suite('.getBlueprintFromInstance', function () {

    test('instance blueprint gets created', function () {

      var instBp = blueprintLibrary.getBlueprintFromInstance({
        inherits: 'parent',
        id: 32342,
        name: 'test'
      });
      assert.equal('test', instBp.component1.prop1);
      assert.equal('test', instBp.name);

    });

    test('instance blueprint is not stored in library', function () {
      var instBp = blueprintLibrary.getBlueprintFromInstance({
        inherits: 'parent',
        id: 32342,
        name: 'test'
      });
      assert.throws(function () {
        blueprintLibrary.getBlueprint('test');
      }, /Undefined blueprint: test/);
    });
  });

  test('.hydrateAllBlueprints');

  /*
   * .find tests
   */
  suite('.find', function () {

    test('should find blueprint');
  });

  /*
   * .getBlueprintsDescendingFrom tests
   */

  suite('.getBlueprintsDescendingFrom', function () {
    test('should find all blueprints descending from parent', function () {
      var arrBlueprints = blueprintLibrary.getBlueprintsDescendingFrom('parent');
      assert.equal(2, arrBlueprints.length);
      assert.propertyVal(arrBlueprints[0], 'name', 'child');
      assert.propertyVal(arrBlueprints[1], 'name', 'child2');
    });

    test('should find all blueprints recursively descending from grandparent', function () {

      var arrBlueprints = blueprintLibrary.getBlueprintsDescendingFrom('grandparent', true);
      assert.equal(3, arrBlueprints.length);
      assert.propertyVal(arrBlueprints[0], 'name', 'parent');
      assert.propertyVal(arrBlueprints[1], 'name', 'child');
      assert.propertyVal(arrBlueprints[2], 'name', 'child2');
    });
  });

  /*
   * .getOriginalBlueprint tests
   */
  suite('.getOriginalBlueprint', function () {
    test('should return the original blueprint', function () {
      var bp = blueprintLibrary.getOriginalBlueprint('child');
      assert.isUndefined(bp.component3);
    });
  });

});
