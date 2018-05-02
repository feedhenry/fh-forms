module.exports = function(grunt) {
  grunt.initConfig({
    asyncpkg: grunt.file.readJSON('node_modules/async/package.json'),
    rulespkg: grunt.file.readJSON('package.json'),
    meta: {},
    lint: {
      files: ['lib/common/forms-rules-engine.js']
    },
    browserify: {
      rulesEngine: {
        src: ['./lib/common/forms-rule-engine.js'],
        dest: 'client/output/rules.js'
      }
    },
    concat: {
      "dist_rules_engine":{
        options: {
          banner: '/*! <%= rulespkg.name %> - v<%= rulespkg.version %> -  */\n' +
            '/*! <%= asyncpkg.name %> - v<%= asyncpkg.version %> -  */\n' +
            '/*! <%= grunt.template.today("yyyy-mm-dd") %> */\n'
        },
        src: [
          "client/output/rules.js"
        ],
        dest: 'client/output/rulesengine.js',
        nonull: true
      },
      "dist_css_generator":{
        src: ['lib/common/themeCSSGenerator.js'],
        dest: 'client/output/cssGenerator.js',
        options: {
          banner: '/*! <%= rulespkg.name %> - v<%= rulespkg.version %> -  */\n' +
            '/*! <%= grunt.template.today("yyyy-mm-dd") %> */\n'
        }
      }
    },
    fhignore: ['client/**'],

    _unit_runner: '_mocha',
    _unit_args: '-A -u exports --recursive -t 10000 ./test/unit',
    unit: '<%= _unit_runner %> <%= _unit_args %>',
    unit_cover: 'istanbul cover --dir cov-unit <%= _unit_runner %> -- <%= _unit_args %>',

    _accept_runner: '_mocha',
    _accept_args: '-A -u exports --recursive -t 10000 ./test/setup_accept.js ./test/accept',
    accept: ['node ./test/setup_mongo_node.js', '<%= _accept_runner %> <%= _accept_args %>'],
    accept_cover: ['node ./test/setup_mongo_node.js', 'istanbul cover --dir cov-accept <%= _accept_runner %> -- <%= _accept_args %>'],

    integrate:['_mocha ./test/integrate'],
    integrate_cover:['istanbul cover --dir cov-integrate _mocha ./test/integrate'],
    coveralls: {
      target: {
        src: 'coverage/lcov.info'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-fh-build');
  grunt.loadNpmTasks('grunt-coveralls');

  grunt.registerTask('buildClient', ['browserify:rulesEngine', 'concat']);

  grunt.registerTask('coverallsio', ['fh:coverage', 'coveralls']);

  grunt.registerTask('dist', ['buildClient', 'fh:dist']);
  grunt.registerTask('default', ['eslint', 'fh-test', 'dist']);
};
