'use strict';

// requires
var gulp          = require('gulp');
var watch         = require('gulp-watch');

// css
var sass          = require('gulp-sass');

// js
var concat        = require('gulp-concat');
var uglify        = require('gulp-uglify');
var rename        = require("gulp-rename");
// var browserify    = require('gulp-browserify');
var babel         = require('gulp-babel');
// var postcss       = require('gulp-postcss');
// var autoprefixer  = require('autoprefixer');

// util
var del           = require('del');
var strip         = require('gulp-strip-comments');
var entityconvert = require('gulp-entity-convert');


gulp.task('clear-build-css', function () {
    return del(['./wenqu/build/css/*.css']);
});

gulp.task('clear-build-js', function () {
    return del(['./wenqu/build/js/*.js']);
});

gulp.task('build-css', ['clear-build-css'], function () {
    return gulp.src('./wenqu/source/scss/wenqu.scss')
        .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
        // .pipe(postcss([autoprefixer()]))
        .pipe(gulp.dest('./wenqu/build/css'));
});

gulp.task('build-js', ['clear-build-js'], function () {
    return gulp.src([
            './wenqu/source/js/class.input.js',
            './wenqu/source/js/class.radio.js',
            './wenqu/source/js/class.sex.js',
            './wenqu/source/js/class.datetime.js',
            './wenqu/source/js/class.popup.js',
            './wenqu/source/js/class.form.js',
            './wenqu/source/js/init.js'
        ])
        .pipe(concat('wenqu.js'))
        .pipe(strip())          // strip comments
        .pipe(entityconvert())  // convert utf-8 chars to html-entities, so can be used on none utf-8 pages
        // .pipe(browserify({ debug: true }))
        .pipe(babel())
        // .pipe(rename('build.js'))
        .pipe(gulp.dest('./wenqu/build/js'))
        .pipe(uglify())
        .pipe(rename(function (path) {
            path.basename += ".min";
            path.extname = ".js";
        }))
        .pipe(gulp.dest('./wenqu/build/js'));
});

gulp.task('watch-css', function () {
    watch('./wenqu/source/scss/*.scss', function (e) {
        return gulp.start('build-css');
    });
});

gulp.task('watch-js', function () {
    watch('./wenqu/source/js/*.js', function (e) {
        return gulp.start('build-js');
    });
});

gulp.task('clear-build', ['clear-build-css', 'clear-build-js']);

gulp.task('build', ['build-css', 'build-js']);

gulp.task('watch', ['watch-css', 'watch-js']);

// gulp.task('watch', function () {
//     gulp.watch('./source/sass/*.sass', ['build-css']);
//     gulp.watch('./source/js/*.js', ['build-js']);
// });
