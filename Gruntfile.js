/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('iris.jquery.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: ['src/<%= pkg.name %>.js', 'libs/color.js'],
        dest: 'dist/<%= pkg.name %>.js'
      },
      basic: {
        src: ['src/<%= pkg.name %>.js'],
        dest: 'dist/<%= pkg.name %>-basic.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/<%= pkg.name %>.min.js'
      },
      basic: {
        src: ['<%= concat.basic.dest %>'],
        dest: 'dist/<%= pkg.name %>-basic.min.js'
      }
    },
    qunit: {
      files: ['test/**/*.html']
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: {
        src: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js']
      }
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'jshint qunit'
    },
    cssmin: {
      dist: {
        src: ['src/iris.css'],
        dest: 'src/iris.min.css'
      }
    }
  });

  grunt.loadNpmTasks( 'grunt-contrib-cssmin' );
  grunt.loadNpmTasks( 'grunt-contrib-uglify' );
  grunt.loadNpmTasks( 'grunt-contrib-watch' );
  grunt.loadNpmTasks( 'grunt-contrib-qunit' );
  grunt.loadNpmTasks( 'grunt-contrib-jshint' );
  grunt.loadNpmTasks( 'grunt-contrib-concat' );

  // Default task.
  grunt.registerTask('default', 'jshint qunit concat uglify'.split(' ') );

};
