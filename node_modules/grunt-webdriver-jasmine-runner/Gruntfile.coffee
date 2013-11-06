module.exports = (grunt) ->
  'use strict'

  grunt.loadTasks 'tasks'

  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-nodeunit'

  grunt.initConfig
    clean:
      tests: ['tmp']

    webdriver_jasmine_runner:
      default_options:
        options: {}
        files:
          'tmp/default_options': ['test/fixtures/testing', 'test/fixtures/123']
      custom_options:
        options:
          separator: ': '
          punctuation: ' !!!'
        files:
          'tmp/custom_options': ['test/fixtures/testing', 'test/fixtures/123']

    nodeunit:
      tests: ['test/*_test.js']

  grunt.registerTask 'test', ['clean', 'webdriver_jasmine_runner', 'nodeunit']

  grunt.registerTask 'default', ['test']
