var gulp =  require('gulp');
var sass =  require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var cssmin = require("gulp-cssmin");
var rename =require('gulp-rename');
var browserSync =require('browser-sync');
var autoprefixer =require('gulp-autoprefixer');
var concat =require('gulp-concat');
var pug = require('gulp-pug');
var fs = require('fs');
var plumber = require('gulp-plumber');
var notify = require("gulp-notify");
var data = require("gulp-data");
var imagemin = require('gulp-imagemin');
var spritesmith = require('gulp-spritesmith');
var pngquant = require('imagemin-pngquant');
var path = require('path');
var pugPHPFilter	= require('pug-php-filter');


/**
 * 開発用のディレクトリを指定します。
 */
var src = {
  // 出力対象は`_`で始まっていない`.pug`ファイル。
  'html': ['./src/**/*.pug', '!' + './src/**/_*.pug'],
  // JSONファイルのディレクトリを変数化。
  'json': './src/_data/',
  'css': './src/css/**/*.css',
  'js': './src/js/**/*.js',
};

/**
 * 出力するディレクトリを指定します。
 */
var dest = {
  'root': './dist/',
  'html': './dist/'
};

/**
 * `.pug`をコンパイルしてから、destディレクトリに出力します。
 * JSONの読み込み、ルート相対パス、Pugの整形に対応しています。
 */
gulp.task('html', function() {
  // JSONファイルの読み込み。
  var locals = {
    'site': JSON.parse(fs.readFileSync(src.json + 'site.json'))
  }
  return gulp.src(src.html)
  // コンパイルエラーを通知します。
  .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
  // 各ページごとの`/`を除いたルート相対パスを取得します。
  .pipe(data(function(file) {
    locals.relativePath = path.relative(file.base, file.path.replace(/.pug$/, '.html'));
      return locals;
  }))
  .pipe(pug({
    // JSONファイルとルート相対パスの情報を渡します。
    locals: locals,
    // Pugファイルのルートディレクトリを指定します。
    // `/_includes/_layout`のようにルート相対パスで指定することができます。
    basedir: 'src',
    // Pugファイルの整形。
    pretty: true,
  }))
  .pipe(gulp.dest(dest.php))
  .pipe(browserSync.reload({stream: true}));
});

//Sassのコンパイル
gulp.task('sass', function() {
  return gulp.src('./src/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(autoprefixer(['last 3 versions', 'ie >= 8', 'Android >= 4', 'iOS >= 8']))    .pipe(gulp.dest('./dist/css/'));s
});

gulp.task( 'copy', function() {
    return gulp.src(
        [ 'src/js/exclude/*.js' ],
        { base: 'src' }
    )
    .pipe( gulp.dest( 'dist' ) );
} );

// JSの統合
gulp.task('concat',function(){
    gulp.src(['./src/js/*.js','!./src/js/exclude/*.js'])
    .pipe(concat('script.js'))
    .pipe(gulp.dest('./dist/js/'))
});

// 画像の圧縮
gulp.task( 'imagemin', function(){
  var imageminOptions = {
    optimizationLevel: 7
  };
  gulp.src( "./src/**/*.+(jpg|jpeg|png|gif|svg)" )
    .pipe(imagemin( imageminOptions ))
    .pipe(gulp.dest( "./dist" ));
});



//ブラウザシンク
gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: dest.root,
      index: "index.html"
    }
  });
});

//ブラウザリロード
gulp.task('bs-reload', function () {
    browserSync.reload();
});

gulp.task('default', ['browser-sync','sass','imagemin','concat','html'], function () {
    gulp.watch('./src/scss/**/*.scss',function(){ //sassフォルダ内のscssファイルを監視
    gulp.src('./src/scss/**/*.scss',+'./src/scss/**/_*.scss') //sassフォルダ内のscssファイルの変更箇所
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./dist/css/'));
    });
    gulp.watch("./src/**/*.pug",+'./src/**/_*.pug', ['html']);
    gulp.watch("./srcimages/**/*.jpg", ['imagemin']);
    gulp.watch("./srcimages/**/*.svg", ['imagemin']);
    gulp.watch("./srcimages/**/*.png", ['imagemin']);
    gulp.watch("./src/js/**/*.js", ['concat']);
    gulp.watch("./src/js/exclude/*.js", ['copy']);
    gulp.watch("./dist/**/*.html", ['bs-reload']);
    gulp.watch("./dist/css/**/*.css", ['bs-reload']);
    gulp.watch("./dist/js/**/*.js", ['bs-reload']);
});
