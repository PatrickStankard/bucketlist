'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: [
        '*.js',
        'src/js/bucketlist.js'
      ],
      options: {
        browser: true,
        jquery: true,
        node: true,
        camelcase: true,
        eqeqeq: true,
        eqnull: true,
        indent: 2,
        latedef: true,
        newcap: true,
        quotmark: 'single',
        trailing: true,
        undef: true,
        unused: true,
        maxlen: 80
      }
    },
    uglify: {
      build: {
        files: [{
          expand: true,
          src: '**/*.js',
          cwd: 'src/js/',
          dest: 'public/js/'
        }]
      }
    },
    cssmin: {
      build: {
        files: [{
          expand: true,
          src: '**/*.css',
          cwd: 'src/css/',
          dest: 'public/css/'
        }]
      }
    },
    replace: {
      build: {
        src: ['src/index.html'],
        dest: 'public/',
        replacements: [{
          from: 'href="/favicon.ico',
          to: 'href="//d2m9ubf1ape1gm.cloudfront.net/bucketlist/favicon.ico'
        }, {
          from: 'href="css/',
          to: 'href="//d2m9ubf1ape1gm.cloudfront.net/bucketlist/css/'
        }, {
          from: 'src="img/',
          to: 'src="//d2m9ubf1ape1gm.cloudfront.net/bucketlist/img/'
        }, {
          from: 'src="js/',
          to: 'src="//d2m9ubf1ape1gm.cloudfront.net/bucketlist/js/'
        }, {
          from: '?_="',
          to: [
            '?_=',
            new Date().getTime(),
            '"'
          ].join('')
        }]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-text-replace');

  grunt.registerTask('test', 'jshint');

  grunt.registerTask('minify', [
    'uglify:build',
    'cssmin:build',
  ]);

  grunt.registerTask('build', [
    'test',
    'minify',
    'replace:build'
  ]);
};
