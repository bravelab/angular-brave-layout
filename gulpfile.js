
  var gulp = require('gulp');
  var Server = require('karma').Server;
  var uglify = require('gulp-uglify');
  var concat = require('gulp-concat');
  var eslint = require('gulp-eslint');
  var conventionalChangelog = require('gulp-conventional-changelog');

  var config = {
    lint: {
      src: [
        'src/**/*.js',
        'test/**/*.spec.js'
      ]
    },
    dist: {
      files: [
        'src/**/*.js'
      ],
      concat: 'angular-brave-layout.js',
      min: 'angular-brave-layout.min.js'
    }
  };


  function runTest(watch, done) {

    var conf = {
      configFile: __dirname + '/test/karma.conf.js',
      singleRun: !watch,
      autoWatch: watch
    };

    return new Server(conf, done).start();
  }

  gulp.task('test', runTest.bind(null, false));
  gulp.task('test:watch', runTest.bind(null, true));

  gulp.task('dist', ['lint', 'test'], function () {

    var files = config.dist.files;

    gulp.src(files)
      .pipe(concat(config.dist.min))
      .pipe(uglify())
      .pipe(gulp.dest('dist'));

    gulp.src(files)
      .pipe(concat(config.dist.concat))
      .pipe(gulp.dest('dist'));
  });

  gulp.task('lint', function () {
    return gulp.src(config.lint.src)
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
  });


  gulp.task('changelog', function () {
    return gulp.src('CHANGELOG.md')
      .pipe(conventionalChangelog({
        // conventional-changelog options go here
        preset: 'angular',
        releaseCount: 0,
        read: false
      }, {
        // context goes here
      }, {
        // git-raw-commits options go here
      }, {
        // conventional-commits-parser options go here
      }, {
        // conventional-changelog-writer options go here
      }))
      .pipe(gulp.dest('./'));
  });

  gulp.task('watch', function () {
    gulp.watch(config.lint.src, ['dist']);
  });

  gulp.task('default', ['watch']);
