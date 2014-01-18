/**
 * Created by shaddockh on 9/14/13.
 */

/* global: describe, it, suite, test, setup */

var assert = require('chai').assert;
var blueprintLibrary = require('lib/blueprintLibrary');

suite("module: blueprintLibrary", function () {
  setup(function () {
    blueprintLibrary.clear();
  });

  test('should be able to load', function () {
    //var blueprintLibrary = require('core/blueprintLibrary');
    assert.isDefined(blueprintLibrary);
  });

  suite('.clear', function () {
    test('clears out library', function () {
      blueprintLibrary.loadSingleBlueprint({
        inherits: '_base',
        component: {
          prop: 'prop'
        }
      }, 'test');

      assert.equal(1, blueprintLibrary.getAllBlueprintNames().length);

      blueprintLibrary.clear();
      assert.equal(0, blueprintLibrary.getAllBlueprintNames().length);
    });

  });

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

    test('load single blueprint should throw an error if loading a duplicate blueprint and dupe checking is turned on.', function () {
      var bp = {
        inherits: '_base',
        name: 'testBP',
        component: {
          prop1: 'prop'
        }
      };
      var testFunc = function () {
        blueprintLibrary.loadSingleBlueprint(bp);
      };
      testFunc();
      assert.throws(testFunc, /eee/);
    });
  });
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

  suite('.getBlueprint', function () {

    setup(function () {

      var block = {
        parent: {
          inherits: '_base',
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
        }
      };
      blueprintLibrary.loadBlueprints(block);
    });

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

  });

  suite('.getAllBlueprintNames', function () {

    test('should list all blueprint names', function () {

      assert.equal(0, blueprintLibrary.getAllBlueprintNames().length);
      blueprintLibrary.loadSingleBlueprint({
        inherits: '_base',
        component: {
          prop: 'prop'
        }
      }, 'testbp');

      assert.equal(1, blueprintLibrary.getAllBlueprintNames().length);
      assert.equal('testbp', blueprintLibrary.getAllBlueprintNames()[0]);
    });

  });

  suite('.getBlueprintFromInstance', function () {
    var block = {
      parent: {
        inherits: '_base',
        component1: {
          prop1: 'test',
        }
      }
    };

    test('instance blueprint gets created', function () {

      blueprintLibrary.loadBlueprints(block);
      var instBp = blueprintLibrary.getBlueprintFromInstance({
        inherits: 'parent',
        id: 32342,
        name: 'test'
      });
      assert.equal('test', instBp.component1.prop1);
      assert.equal('test', instBp.name);

    });

    test('instance blueprint is not stored in library', function () {
      blueprintLibrary.loadBlueprints(block);
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
  test('.find');
  suite('.getOriginalBlueprint', function () {
    test('should return the original blueprint', function () {

      var block = {
        parent: {
          inherits: '_base',
          component1: {
            prop1: 'test',
            overrideProp: 'parent'
          },
          component3: {
            prop3: 'my component 3'
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
        }
      };
      blueprintLibrary.loadBlueprints(block);

      var bp = blueprintLibrary.getOriginalBlueprint('child');
      assert.isUndefined(bp.component3);
    });
  });

});
