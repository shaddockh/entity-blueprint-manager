module.exports = function (grunt) {

  var scriptdirs = ['lib/*.js', 'test/**/*.js'];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: ['Gruntfile.js'].concat(scriptdirs),
      options: {
        jshintrc: '.jshintrc'
      }
    },
    jsbeautifier: {
      modify: {
        src: ['Gruntfile.js'].concat(scriptdirs),
        options: {
          config: '.jsbeautifyrc'
        }
      },
      verify: {
        src: ['Gruntfile.js'].concat(scriptdirs),
        options: {
          mode: 'VERIFY_ONLY',
          config: '.jsbeautifyrc'
        }
      }
    },
    mochaTest: {
      options: {
        reporter: 'spec',
        require: ['chai'],
        ui: 'tdd'

      },
      src: ['test/**/*.js']
    }
  });

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.registerTask('clean', ['jsbeautifier:modify', 'jshint']);
  grunt.registerTask('verify', ['jsbeautifier:verify', 'jshint']);

  grunt.registerTask('test', ['verify', 'mochaTest']);

  grunt.registerTask('default', ['test']);
};
