/**
 * Created by shaddockh on 9/14/13.
 */

/* global: describe, it, suite, test, setup */

var assert = require('chai').assert;
var MixinCatalog = require('../lib').MixinCatalog;
var mixins = new MixinCatalog();

/*
 * blueprint library
 */
suite("module: mixins", function () {
  setup(function () {
    mixins.clear();

    /* seed with some mixins */

    var block = {
      mixin1: {
        name: 'mixin1'

      },
      Mixin2: {
        name: 'mixin2'

      }
    };
    mixins.loadMixins(block);

  });

  test('should be able to load', function () {
    assert.isDefined(mixins);
  });

  suite('.clear', function () {
    test('clears out catalog', function () {

      assert.notEqual(0, mixins.getAllMixinNames().length);

      mixins.clear();
      assert.equal(0, mixins.getAllMixinNames().length);

    });

  });

  /*
   * .loadSingleMixin tests
   */
  suite('.loadSingleMixin', function () {

    test('can load a single mixin', function () {
      var mixin = {
        name: 'mixin1'
      };

      mixins.loadSingleMixin(mixin);

      var result = mixins.getMixin('mixin1');
      assert.isDefined(result);
      assert.equal('mixin1', result.name);

    });
    test('load single mixin with name attached should not throw error', function () {
      var mixin = {
        name: 'mixin1'
      };
      mixins.loadSingleMixin(mixin);

      var result = mixins.getMixin('mixin1');
      assert.isDefined(result);
      assert.equal('mixin1', result.name);
    });

    test('load single mixin should throw an error if loading a duplicate blueprint and dupe checking is turned on.');

  });

  /*
   * .loadMixin tests
   */
  suite('.loadMixins', function () {
    test('can load a mixin block', function () {
      var block = {
        mixin1: {
          name: 'mixin1',
          inherits: '_base',
          component: {
            prop1: 'prop'
          }
        }
      };
      mixins.clear();
      mixins.loadMixins(block);
      var result = mixins.getMixin('mixin1');
      assert.isDefined(result);
      console.log(result);
      assert.equal('_base', result.inherits);
    });
    test('should not allow duplicate mixins', function () {
      var block = {
        mixin1: {
          name: 'mixin1',
          inherits: '_base',
          component: {
            prop1: 'prop'
          }
        }
      };
      mixins.loadMixins(block);
      mixins.loadMixins(block);

      var result = mixins.getMixin('mixin1');
      assert.isDefined(result);
    });
  });

  /*
   * .getMixin test
   */
  suite('.getMxin', function () {

    test('should return mixin', function () {
      var bp = mixins.getMixin('mixin1');
      assert.isDefined(bp);
    });

    test('should return mixin regardless of case', function () {
      var bp = mixins.getMixin('MixIn1');
      assert.isDefined(bp);
    });

    test('should throw an error if trying to get a mixin that does not exist', function () {
      var testFunc = function () {
        mixins.getMixin('not-exist');
      };
      assert.throws(testFunc, /Item does not exist in catalog: not-exist/);
    });
  });

  /*
   * .getAllMixinNames tests
   */
  suite('.getAllMixinNames', function () {

    test('should list all mixin names', function () {
      assert.deepEqual(['mixin1', 'mixin2'], mixins.getAllMixinNames());
    });

  });

  /*
   * .hasMixin tests
   */
  suite('.hasMixin', function () {

    test('should have mixin', function () {
      assert.isTrue(mixins.hasMixin('mixin1'));
    });

    test('should not have mixin', function () {
      assert.isFalse(mixins.hasMixin('mixin33'));
    });

  });

  /*
   * .find tests
   */
  suite('.find', function () {

    test('should find mixin');
  });

});
