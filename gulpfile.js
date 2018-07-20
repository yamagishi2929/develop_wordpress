var gulp =  require('gulp');
var sass =  require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var cssmin = require("gulp-cssmin");
var rename = require('gulp-rename');



var browserSync = require('browser-sync');
var connect = require('gulp-connect-php');


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

/** 開発用のディレクトリを指定します。 */
var src = {
  // 出力対象は`_`で始まっていない`.pug`ファイル。
  'pug': ['src/**/*.pug', '!' + 'src/**/_*.pug'],
  // JSONファイルのディレクトリを変数化。
  'json': 'src/_data/',
  'sass': 'src/sass/**/*.sass',
  'js': 'src/js/**/*.js',
};

/** 出力するディレクトリを指定します。*/
var dest = {
  'root': 'vccw/wordpress/wp-content/themes/mytheme/',
  'php': 'vccw/wordpress/wp-content/themes/mytheme/'
};

/** `.pug`をコンパイルしてから、destに出力します。  JSONの読み込み、ルート相対パス、Pugの整形に対応しています。
*/
gulp.task('pug', function() {
  // JSONファイルの読み込み。
  var locals = {
    'site': JSON.parse(fs.readFileSync(src.json + 'site.json'))
  }
  return gulp.src(src.pug)
  // コンパイルエラーを通知します。
  .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
  // 各ページごとの`/`を除いたルート相対パスを取得します。
  .pipe(data(function(file) {
    locals.relativePath = path.relative(file.base, file.path.replace(/.pug$/, '.php'));
      return locals;
  }))
  .pipe(pug({
    // JSONファイルとルート相対パスの情報を渡します。
    locals: locals,
    // Pugファイルのルートディレクトリを指定します。
    basedir: 'src',
    // Pugファイルの整形。
    pretty: true,
    filters: {
			php: pugPHPFilter
		}
  }))
  .pipe(rename({
    extname: '.php'
  }))
  .pipe(gulp.dest(dest.php))
  .pipe(browserSync.reload({stream: true}));
});

//Sassのコンパイル
gulp.task('sass', function() {
  return gulp.src('src/sass/**/*.sass',+'src/sass/**/_*.sass')
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(autoprefixer(['last 3 versions', 'ie >= 8', 'Android >= 4', 'iOS >= 8']))
    .pipe(gulp.dest('vccw/wordpress/wp-content/themes/mytheme/css/'));
});

gulp.task('sass-watch', ['sass'], function(){
  var watcher = gulp.watch('src/sass/**/*.sass',+'src/sass/**/_*.sass' ['sass']);
  watcher.on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  });
});

gulp.task( 'copy', function() {
    return gulp.src(
        [ 'src/js/exclude/*.js' ],
        { base: 'src' }
    )
    .pipe( gulp.dest( 'dest' ) );
} );

// JSの統合
gulp.task('concat',function(){
    gulp.src(['src/js/*.js','!'+'/src/js/exclude/*.js'])
    .pipe(concat('script.js'))
    .pipe(gulp.dest('vccw/wordpress/wp-content/themes/mytheme/js'))
});

// 画像の圧縮
gulp.task( 'imagemin', function(){
  var imageminOptions = {
    optimizationLevel: 7
  };
  gulp.src( "src/**/*.+(jpg|jpeg|png|gif|svg)" )
    .pipe(imagemin( imageminOptions ))
    .pipe(gulp.dest( "vccw/wordpress/wp-content/themes/mytheme/" ));
});

//----------------------------------------------------------------------------------------------------------------------------------
//ローカルサーバーを起動

gulp.task('connectSync', function() {
  connect.server({
    port:'vccw.test',
    base:'www',
  }, function (){
    browserSync({
      proxy: 'vccw.test/'
    });
  });
});

gulp.task('browserSync', function() {
  browserSync.init({
    //変更
    proxy: "vccw.test/"
  });
});

//ブラウザリロード
gulp.task('reload', function () {
  browserSync.reload();
});

//----------------------------------------------------------------------------------------------------------------------------------

gulp.task('default', ['browserSync','sass','imagemin','concat','pug','sass-watch'], function () {
  gulp.watch('src/sass/**/*.sass',function(){ //sassフォルダ内のsassファイルを監視
  gulp.src('src/sass/**/*.sass') //sassフォルダ内のsassファイルの変更箇所
      .pipe(sass().on('error', sass.logError))
      .pipe(gulp.dest('vccw/wordpress/wp-content/themes/mytheme/css/'));
  });
  gulp.watch("src/**/*.pug",+'src/**/_*.pug', ['pug']);
  gulp.watch("src/images/**/*.jpg", ['imagemin']);
  gulp.watch("src/images/**/*.svg", ['imagemin']);
  gulp.watch("src/images/**/*.png", ['imagemin']);
  gulp.watch("src/js/**/*.js", ['concat']);
  gulp.watch("src/js/exclude/*.js", ['copy']);
  gulp.watch("src/sass/**/_*.sass", ['reload']);
  gulp.watch("vccw/wordpress/wp-content/themes/mytheme/**/*.php", ['reload']);
  gulp.watch("vccw/wordpress/wp-content/themes/mytheme/css/style.css", ['reload']);
  gulp.watch("vccw/wordpress/wp-content/themes/mytheme/js/**/*.js", ['reload']);
});
