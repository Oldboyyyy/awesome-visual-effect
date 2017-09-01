const gulp = require('gulp')
const concat = require('gulp-concat')
const changed = require('gulp-changed')
const sass = require('gulp-sass')
const postcss = require('gulp-postcss')
const uglify = require('gulp-uglify')
const rename = require('gulp-rename')
const csso =require('gulp-csso')
const imagemin = require('gulp-imagemin')
const merge = require('gulp-merge')
const spritesmith = require('gulp.spritesmith')
const babel = require('gulp-babel')
const del = require('del')
const browserSync = require('browser-sync')
const autoprefixer = require('autoprefixer')
const cssnext = require('cssnext')
const precss = require('precss')
const buffer = require('vinyl-buffer')
const processors = [
  autoprefixer({browsers: ['last 2 version']}),
  cssnext,
  precss
]

let demoPaths = ['love-is-love', 'text-particle']

gulp.task('delete', function(cb){
  return del(['./dist/**/*'], cb)
})

gulp.task('html', function(){
  gulp.src('./src/**/*.html')
    .pipe(gulp.dest('./dist'))
    .pipe(browserSync.reload({stream:true}))
})


gulp.task('scss', () => {
  demoPaths.forEach((item) => {
    gulp.src(`./src/${item}/*.scss`)
    .pipe(changed(`./dist/${item}/*.css`, {hasChanged: changed.compareSha1Digest}))
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(concat('app.css'))
    .pipe(postcss(processors))
    .pipe(gulp.dest(`./dist/${item}/`))
    .pipe(browserSync.reload({stream:true}))
  })
})

gulp.task('js', () => {
  demoPaths.forEach((item) => {
    gulp.src(`./src/${item}/*.js`)
    .pipe(babel({
      presets: ['es2015']
    }).on('error', (err) => {console.log(err)}))
    .pipe(gulp.dest(`./dist/${item}/`))
    .pipe(browserSync.reload({stream:true}))
  })
})

gulp.task('server', ['delete'], function(){
  gulp.start(['scss', 'html', 'js']);
  browserSync.init({
    port:8096,
    server: {
      baseDir: './dist'
    },
  });
  gulp.watch('./src/**/*.scss', ['scss'])
  gulp.watch('./src/**/*.html', ['html'])
  gulp.watch('./src/**/*.js', ['js'])
})


gulp.task('default', ['server'])