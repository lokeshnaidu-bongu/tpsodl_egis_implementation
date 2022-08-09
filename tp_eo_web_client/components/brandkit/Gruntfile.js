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
              src: ['hdx-brandkit.less', 'iidx-brandkit.less', 'cdx-brandkit.less'],
              dest: 'css/',
              ext: '.css',
              nonull: true
            }]
          }
        },

        watch: {
          component: {
            files: ['less/**/*'],
            tasks: 'less',
            options: {
              interrupt: true
            }
          }
        },

        karma: {
            "hdx-unit": {
                configFile: 'test/unit/hdx-karma.conf.js'
            },
            "iidx-unit": {
                configFile: 'test/unit/iidx-karma.conf.js'
            }
        },
        jshint: {
          all: [
              'Gruntfile.js',
              'js/*.js'
          ],
          options: {
              jshintrc: '.jshintrc'
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
        }

  });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // Default task.
    grunt.registerTask('default', 'Build the LESS for testing', [
        'clean',
        'shell:bower-install',
        'less'
    ]);

    grunt.registerTask('test', 'Run tests for this component.', [
        'clean:test',
        //'jshint',
        'karma:hdx-unit',
        'karma:iidx-unit'
    ]);

};
