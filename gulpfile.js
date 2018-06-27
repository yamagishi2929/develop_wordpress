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
  'html': ['src/**/*.pug', '!' + 'src/**/_*.pug'],
  // JSONファイルのディレクトリを変数化。
  'json': 'src/_data/',
  'css': 'src/css/**/*.css',
  'js': 'src/js/**/*.js',
};

/**
 * 出力するディレクトリを指定します。
 */
var dest = {
  'root': 'wordpress/wp-content/themes/mytheme/',
  'php': 'wordpress/wp-content/themes/mytheme/'
};

/**
 * `.pug`をコンパイルしてから、destディレクトリに出力します。
 * JSONの読み込み、ルート相対パス、Pugの整形に対応しています。
 */
gulp.task('pug', function() {
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
    pretty: true
  }))
  let option = {
		pretty: true,
		filters: {
			php: pugPHPFilter
		}
	}
  return gulp.src(src.html)
	.pipe(pug(option))
	.pipe(rename({
		extname: '.php'
	}))
  .pipe(gulp.dest(dest.php))
  .pipe(browserSync.reload({stream: true}));
});

//Sassのコンパイル
gulp.task('sass', function() {
  return gulp.src('src/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(autoprefixer(['last 3 versions', 'ie >= 8', 'Android >= 4', 'iOS >= 8']))
    .pipe(gulp.dest('wordpress/wp-content/themes/mytheme/css'));
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
    .pipe(gulp.dest('wordpress/wp-content/themes/mytheme/js'))
});

// 画像の圧縮
gulp.task( 'imagemin', function(){
  var imageminOptions = {
    optimizationLevel: 7
  };
  gulp.src( "src/**/*.+(jpg|jpeg|png|gif|svg)" )
    .pipe(imagemin( imageminOptions ))
    .pipe(gulp.dest( "wordpress/wp-content/themes/mytheme/images" ));
});


//ブラウザシンク
gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: dest.root,
      index: "index.php"
    }
  });
});

//ブラウザリロード
gulp.task('bs-reload', function () {
    browserSync.reload();
});

gulp.task('default', ['browser-sync','sass','imagemin','concat','pug'], function () {
    gulp.watch('src/scss/**/*.scss',function(){ //sassフォルダ内のscssファイルを監視
    gulp.src('src/scss/**/*.scss',+'src/scss/**/_*.scss') //sassフォルダ内のscssファイルの変更箇所
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('dest/css/'));
    });
    gulp.watch("src/**/*.pug",+'src/**/_*.pug', ['pug']);
    gulp.watch("srcimages/**/*.jpg", ['imagemin']);
    gulp.watch("srcimages/**/*.svg", ['imagemin']);
    gulp.watch("srcimages/**/*.png", ['imagemin']);
    gulp.watch("src/js/**/*.js", ['concat']);
    gulp.watch("src/js/exclude/*.js", ['copy']);
    gulp.watch("wordpress/wp-content/themes/mytheme/**/*.html", ['bs-reload']);
    gulp.watch("wordpress/wp-content/themes/mytheme/css/**/*.css", ['bs-reload']);
    gulp.watch("wordpress/wp-content/themes/mytheme/js/**/*.js", ['bs-reload']);
});
