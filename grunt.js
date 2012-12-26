module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
  });
  grunt.registerTask('default', function() {
    grunt.log.write("Testing").ok();
  });
}
