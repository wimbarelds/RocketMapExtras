var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    babel = require('gulp-babel'),
    plumber = require('gulp-plumber'),
    replace = require('gulp-replace'),
    fs = require('fs');

var config = JSON.parse(fs.readFileSync('./gulp-config.json'));

var SOURCE_PATH = 'source/RocketMapExtras';
var DEST_PATH = 'dest/RocketMapExtras';

gulp.task('sass', function(){
    var pipe = gulp.src(SOURCE_PATH + '/scss/extras.scss')
        .pipe(plumber());

    config.replace.forEach((input) => pipe = pipe.pipe(replace(input.searchStr, input.replaceStr)));
    pipe.pipe(sass())
        .pipe(autoprefixer('last 2 version'))
        .pipe(gulp.dest(DEST_PATH + '/css'));
});

gulp.task('js', function(){
    var pipe = gulp.src([SOURCE_PATH + '/js/**/*.js'])
        .pipe(plumber());

    config.replace.forEach((input) => pipe = pipe.pipe(replace(input.searchStr, input.replaceStr)));
    pipe.pipe(babel({ presets: ['es2015'] }))
        .pipe(gulp.dest(DEST_PATH + '/js'));
});

gulp.task('php', function(){
    var pipe = gulp.src([SOURCE_PATH + '/**/*.php'])
        .pipe(plumber());

    config.replace.forEach((input) => pipe = pipe.pipe(replace(input.searchStr, input.replaceStr)));
    pipe.pipe(gulp.dest(DEST_PATH));
});

gulp.task('build', ['js', 'sass', 'php']);

gulp.task('watch', function(){
    gulp.watch(SOURCE_PATH + '/scss/**/*.scss', ['sass']);
    gulp.watch(SOURCE_PATH + '/js/**/*.js', ['js']);
    gulp.watch(SOURCE_PATH + '/**/*.php', ['php']);
});

gulp.task('dev', ['build', 'watch']);

gulp.task('default', ['dev']);