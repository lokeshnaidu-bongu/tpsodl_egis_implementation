'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    clean: {
      test: ['test/unit/report*', 'test/ui/report*']
    },

    shell: {
      options: {
        stdout: true,
        stderr: true
      },
      bower: {
        command: 'bower install',
        options: {stdout: true, stderr: true}
      }
    },

    jshint: {
      all: [
        'Gruntfile.js',
        'src/**/*.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

      less: {
          compile: {

              files: [
                  {
                      expand: true,
                      src: ['components/bootstrap/less/bootstrap.less'],
                      ext: '.css',
                      nonull: true
                  }
              ]
          }
      },

    karma: {
      unit: {
        configFile: 'test/unit/karma.conf.js'
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-karma');


  // Test task.
  grunt.registerTask('test', 'Run full test suite', [
    'clean:test',
    'jshint',
    'karma'
  ]);

  // Default task.
  grunt.registerTask('default', 'Build the LESS for testing', [
    'clean',
    'shell:bower',
    'less',
    'test'
  ]);

};
