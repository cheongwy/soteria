module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      files: ['Gruntfile.js', 'lib/**/*.js', 'test/**/*.js'],
      options: {}
    },
    nodeunit: {
    	local: {
    		src: ['test/**/test.js'],
            options: {}
    	},
    	external: {
    		src: ['test/**/*test_external*.js'],
    	},
        options: {}
      },
      env: {
    	  local: {
    		  NODE_ENV: 'test'    		  
    	  },
    	  external: {
    		  NODE_ENV: 'external'
    	  }    	  
      }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-env');
  
  grunt.registerTask('local', ['jshint','env:local','nodeunit:local']);
  grunt.registerTask('external',['jshint','env:external','nodeunit:external']);
};