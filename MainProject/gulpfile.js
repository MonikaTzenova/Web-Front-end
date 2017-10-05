var gulp = require('gulp'),
eslint = require('gulp-eslint'),
babel = require("gulp-babel"),
gulpsync = require('gulp-sync')(gulp),
clean = require("gulp-clean"),
csslint = require('gulp-csslint');

//Clean
gulp.task("clean", () => {
    return gulp.src("result", { read: false })
        .pipe(clean({ force: true }));
});
//  Copy
gulp.task("copy:html", () => {
    return gulp.src("./**/*.html")
        .pipe(gulp.dest("result"));
});
gulp.task("copy:templates", () => {
    return gulp.src("templates/**/*.handlebars")
        .pipe(gulp.dest("result/templates"));
});
gulp.task("copy", gulpsync.sync(["copy:html", "copy:templates"]));

//Lint
gulp.task("lint:js", () => {
    return gulp.src(["js/**/*.js", "!node_modules/**"])
        .pipe(eslint({configFile: 'eslintrc.json'}))
        // .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});
gulp.task('lint:css', function() {
  gulp.src('css/*.css')
    .pipe(csslint())
    .pipe(csslint.formatter());
});
gulp.task("lint", ["lint:js", "lint:css"]);

//  Compile
gulp.task("compile:js", () => {
    return gulp.src("js/**/*.js")
        .pipe(babel({
            presets: ["es2015"]
        }))
        .pipe(gulp.dest("result/js"));
});
gulp.task("compile", gulpsync.sync(["compile:js"]));

//Minify
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');
const imagemin = require('gulp-imagemin'),
uglify = require('gulp-uglify'),
pump = require('pump');
 
gulp.task('mincss', function () {
    gulp.src('css/*.css')
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('result/css'));
});
gulp.task('imagemin', () =>
    gulp.src('images/*')
        .pipe(imagemin())
        .pipe(gulp.dest('result/images'))
);
gulp.task('compress:js', function (cb) {
  pump([
        gulp.src('result/js/**/*.js'),
        uglify(),
        gulp.dest('result/js')
    ],
    cb
  );
});
gulp.task("minify", ["mincss", "imagemin", "compress:js"]);

//  Final
gulp.task("build", gulpsync.sync(["lint", "clean", "compile", "copy", "minify"]));

//Watch
gulp.task('watch', function () {
  // Watch .js files
  gulp.watch('js/**/*.js', ['js']);

});
gulp.task('default', ['watch']);