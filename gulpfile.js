const gulp = require('gulp'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    browserSync = require('browser-sync').create();

gulp.task('serve', function(){
    gulp.watch('**').on('change', () => {
        browserSync.reload();
    });

    browserSync.init({
        server: ["./", "./example"]
    });
});

gulp.task('serve-test', function(){
    gulp.watch('**').on('change', () => {
        browserSync.reload();
    });

    browserSync.init({
        server: ["./", "./test"]
    });
});

gulp.task('compress', function(){
    return gulp.src(['scroll-snooper.js'], {base: "./"})
        // This will output the non-minified version
        .pipe(gulp.dest('.'))
        // This will minify and rename to foo.min.js
        .pipe(uglify({
            output: {
                comments: /!/
            }
        }))
        .pipe(rename({extname: '.min.js'}))
        .pipe(gulp.dest('.'));
});