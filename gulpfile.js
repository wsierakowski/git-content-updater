'use strict';

const gulp = require('gulp');
const eslint = require('gulp-eslint');

gulp.task('lint', () => gulp.src(['gulpfile.js', 'lib/**/*.js', 'test/**/*.spec.js'])
  .pipe(eslint())
  .pipe(eslint.failAfterError()));
