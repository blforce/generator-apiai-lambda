const gulp = require('gulp');
const babel = require('gulp-babel');
var exec = require('child_process').execSync;
const clean = require('gulp-clean');

const destination = './dist';

gulp.task('clean', function() {
    return gulp.src(destination, {read: false})
            .pipe(clean());
})

gulp.task('extra', ['clean'], () => {
    return gulp.src(['claudia.json', 'package.json'])
        .pipe(gulp.dest(destination));
});

gulp.task('default', ['extra'], ()=> {
    return gulp.src('src/**/*.js')
        .pipe(babel({presets: ['es2015', 'es2016', 'es2017']}))
        .pipe(gulp.dest(destination));
});

gulp.task('publish', ['default'], (callback) => {
    exec('node_modules/.bin/claudia update --set-env-from-json ../lambda-vars.json',
        {
            "cwd": destination
        });
});