    /*global module:false*//*jshint unused:false*/

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: {
      bower: ['components'],
      test: ['test/unit/report*', 'test/ui/report*']
    },

    less: {
      compile: {
        options: {
          paths: ['less/', 'components/']
        },
        files: [{
          expand: true,
          cwd: 'less/',
          src: ['iidx-jumpnav.less', 'cdx-jumpnav.less','hdx-jumpnav.less','hdx-jumpnav-lights-off.less'],
          dest: 'css/',
          ext: '.css',
          nonull: true
        }]
      }
    },

    watch: {
      component: {
        files: ['less/**/*', 'js/**/*', 'test/**/*'],
        tasks: 'default',
        options: {
          interrupt: true
        }
      }
    },
    // Install bower components
    shell: {
      "bower-install": {
          command: 'bower install',
          options: {
              stdout: true
          }
      }
    },
    karma: {
      unit: {
          configFile: 'test/unit/karma.conf.js'
      },
      hdx: {
          configFile: 'test/unit/karma.hdx.conf.js'
      }
    },
    jshint: {
      all: [
          'Gruntfile.js',
          'js/**/*.js'
      ],
      options: {
          jshintrc: '.jshintrc'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-karma');


  grunt.registerTask('test', 'Run tests for this component.', [
    'clean:test',
    //'jshint',
    'karma:unit'
  ]);

  // Default task.
  grunt.registerTask('default', 'Build the LESS for testing', [
    'clean',
    'shell:bower-install',
    'less'
  ]);

};
