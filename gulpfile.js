'use strict'

let gulp = require('gulp')
let mocha = require('gulp-mocha')
let plumber = require('gulp-plumber')
let jshint = require('gulp-jshint')
let jsonlint = require('gulp-json-lint')

let paths = {
  js: ['*.js', '*/*.js', '*/**/*.js', '!node_modules/**'],
  json: ['*.json', '*/*.json', '*/**/*.json', '!node_modules/**'],
  tests: ['./test/*.js']
}

gulp.task('jslint', () => {
  return gulp.src(paths.js)
    .pipe(plumber())
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'))
})

gulp.task('jsonlint', () => {
  return gulp.src(paths.json)
    .pipe(plumber())
    .pipe(jsonlint({
      comments: true
    }))
    .pipe(jsonlint.report())
})

gulp.task('run-tests', () => {
  return gulp
    .src(paths.tests, {
      read: false
    })
    .pipe(mocha({
      reporter: 'list'
    }))
    .once('error', (error) => {
      console.error(error)
      process.exit(1)
    })
    .once('end', () => {
      process.exit()
    })
})

gulp.task('lint', ['jslint', 'jsonlint'])
gulp.task('test', ['lint', 'run-tests'])
