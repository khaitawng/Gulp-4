
const gulp = require("gulp");
const { parallel, series } = require("gulp");

const imagemin = require("gulp-imagemin");
const htmlmin = require("gulp-htmlmin");
const uglify = require("gulp-uglify");
const sass = require("gulp-sass");
const cleanCSS = require('gulp-clean-css');
const concat = require("gulp-concat");
const browserSync = require("browser-sync").create();
const mergeStream =   require('merge-stream');
const autoprefixer = require('gulp-autoprefixer');
const cache = require('gulp-cache');

// /*
// TOP LEVEL FUNCTIONS
//     gulp.task = Define tasks
//     gulp.src = Point to files to use
//     gulp.dest = Points to the folder to output
//     gulp.watch = Watch files and folders for changes
// */

// OPTIMISE IMAGES
function imageMin(cb) {
    gulp.src("src/images/**/*")
        .pipe(cache(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))
        .pipe(gulp.dest("dist/images"));
    cb();
}

// MINIFY HTML
function minifyHTML(cb) {
    gulp.src("src/*.html")
        .pipe(
            htmlmin({
                collapseWhitespace: true
            })
        )
        .pipe(gulp.dest("dist"));
    cb();
}

// MINIFY COPY
function copy() {
  return mergeStream(
    gulp.src('src/fonts/*.woff')
        .pipe(gulp.dest("dist/fonts")),

        gulp.src('src/fonts/*.woff2')
        .pipe(gulp.dest("dist/fonts")),

    gulp.src('src/css/*.css')
        .pipe(gulp.dest("dist/css")),

    gulp.src('src/js/*.js')
        .pipe(gulp.dest("dist/js"))
  );
}

// SCRIPTS
function js(cb) {
    gulp.src("src/js/*js")
        .pipe(concat("custom.js"))
        .pipe(uglify())
        .pipe(gulp.dest("dist/js"));
    cb();
}

// COMPILE SASS
function css(cb) {
    gulp.src("src/scss/*.scss")
        .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
        .pipe(autoprefixer({
            browserlist: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest("src/css"))
        // Stream changes to all browsers
        .pipe(browserSync.stream());
    cb();
}

// WATCH FILES
function watch_files() {
    browserSync.init({
        server: {
            baseDir: "src/"
        }
    });
    gulp.watch("src/scss/*.scss", css);
    gulp.watch("src/js/*.js", js).on("change", browserSync.reload);
    gulp.watch("src/*.html").on("change", browserSync.reload);
}

// Default 'gulp' command with start local server and watch files for changes.
exports.default = series(css, watch_files);

// 'gulp build' will build all assets but not run on a local server.
exports.build = parallel(css, js, minifyHTML, copy, imageMin);


