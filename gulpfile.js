const gulp = require('gulp'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    compressFiles = ['scroll-snooper.js'];

gulp.task('compress', function(){
    return gulp.src(compressFiles, {base: "./"})
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