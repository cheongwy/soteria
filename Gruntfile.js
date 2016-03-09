module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      files: ['Gruntfile.js', 'lib/**/*.js', 'test/**/*.js'],
      options: {}
    },
    nodeunit: {
        all: ['test/**/*test.js'],
        options: {}
      }    
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  
  grunt.registerTask('default', ['jshint','nodeunit']);

};