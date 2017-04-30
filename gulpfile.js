const gulp = require('gulp'),
      babelify = require('babelify'),
      browserify = require('browserify'),
      source = require('vinyl-source-stream'),
      buffer = require('vinyl-buffer'),
      uglify = require('gulp-uglify'),
      pump = require('pump'),
      cssmin = require('gulp-cssmin'),
      rename = require('gulp-rename'),
      sass = require('gulp-sass'),
      sourcemaps = require('gulp-sourcemaps'),
      autoprefixer = require('gulp-autoprefixer'),
      reload = require('gulp-livereload');


// ... variables
const autoprefixerOptions = {
  browsers: ['last 2 versions', '> 5%', 'Firefox ESR']
};


//////////////////////////////////////////////////////////////////////////////////
///////////////////////Module compiler and ES6 compiler///////////////////////////
//////////////////////////////////////////////////////////////////////////////////

//Babel=>es2015
gulp.task('es6',() => {
        browserify('src/js/main.js')
          .transform('babelify', {
              presets: ['es2015']
          })
          .bundle()
          .pipe(source('main.js'))
          .pipe(buffer())
          .pipe(gulp.dest('public/js/'))
          // .pipe(reload());
});



//////////////////////////////////////////////////////////////////////////////////
///////////////////////JS Minify and rename commands//////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

//js uglify
gulp.task('compress',cb => {
  pump([
        gulp.src('public/js/main.js'),
        uglify(),
        rename({suffix: '.min'}),
        gulp.dest('./public/js/'),
        reload()
    ],
    cb
  );
});

// copy js file to public folder

// gulp.task('copy', function(){
//    return   gulp.src('source/js/main.js')
//             .pipe(gulp.dest('public/js/'));

// });


//////////////////////////////////////////////////////////////////////////////////
///////////////SASS/sourcemap/autoprefix/minify and rename command////////////////
//////////////////////////////////////////////////////////////////////////////////

// SASS
gulp.task('sass',() => {
  return gulp.src('src/scss/styles.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(gulp.dest('public/css/'))
    .pipe(cssmin())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('public/css/'))
    .pipe(reload());
});


//SAS Watch 
gulp.task('sass:watch',() => {
  gulp.watch('src/scss/**/*.scss', ['sass']);
});


//////////////////////////////////////////////////////////////////////////////////
///////////////////////////Global watch commands//////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////


gulp.task('watch',['sass'],() =>  {
  reload.listen();
  gulp.watch('src/index.html', ['default']);
  gulp.watch('src/js/**/*.js', ['es6']);
  gulp.watch('src/scss/**/*.scss', ['sass']);
  gulp.watch('public/js/main.js', ['compress']);
});


//////////////////////////////////////////////////////////////////////////////////
///////////////////////////defaults, builds///////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

//gulp defaults tasks
gulp.task('default', ['es6','compress','watch']);   //run gulp

//gulp build
gulp.task('build', ['compress']); // run gulp build