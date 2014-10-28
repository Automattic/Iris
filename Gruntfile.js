/*global module,require*/

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
    cssmin: {
      dist: {
        src: ['src/iris.css'],
        dest: 'src/iris.min.css'
      }
    },
    replace: {
      dist: {
        options: {
          patterns: [{
            match:  /_css = '.+';$/m,
            replacement: function() {
              var css = grunt.file.read( 'src/iris.min.css' );
              return '_css = \'' + css + '\';';
            }
          }]
        },
        files: [{
          src: [ 'src/iris.js' ],
          dest: 'src/iris.js'
        }]
      }
    },
    watch: {
      js: {
        files: [ 'src/iris.js' ],
        tasks: [ 'jshint', 'concat', 'uglify' ]
      },
      css: {
        files: [ 'src/iris.css' ],
        tasks: [ 'css' ]
      }
    }
  });

  require( 'load-grunt-tasks' )( grunt );

  grunt.registerTask('css', ['cssmin', 'replace']);

  // Default task.
  grunt.registerTask('default', 'css jshint qunit concat uglify'.split(' ') );

};
