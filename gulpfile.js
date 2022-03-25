const gulp = require('gulp'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    browserSync = require('browser-sync').create(),
    replace = require('gulp-replace'),
    readlineSync = require('readline-sync');

/**
 * Serve: Example
 */
gulp.task('serve', function(){
    gulp.watch('**').on('change', () => {
        browserSync.reload();
    });

    browserSync.init({
        server: ["./", "./example"]
    });
});

/**
 * Dev
 */
gulp.task('dev', function(){
    gulp.watch('**').on('change', () => {
        browserSync.reload();
    });

    browserSync.init({
        server: ["./", "./test"]
    });
});

/**
 * Release
 */
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

let oldVersion = '', newVersion = '', count = 1;
gulp.task('replace', function(){
    return gulp.src(['./scroll-snooper.js', './README.md', './test/*', './example/*'])
        .pipe(replace(oldVersion, function handleReplace(match){
            console.log(`[${count}] Found "${oldVersion}"`);
            count++;
            return newVersion;
        }))
        .pipe(gulp.dest(function(file){
            console.log(file.base)
            return file.base;
        }, {overwrite: true}));
});

gulp.task('release', gulp.series(
    'compress',
    function(done){
        oldVersion = readlineSync.question('Enter the current version to replace: ');
        return done();
    },
    function(done){
        newVersion = readlineSync.question('New version: ');
        return done();
    },
    function(done){
        if(readlineSync.keyInYN(`Do you want to replace "${oldVersion}" with "${newVersion}" in all files?`)){
            return done();
        }
        console.log('Ok, not replace, stop releasing.');
        process.exit(1);
    },
    'replace'
));