/*
 TODO:
        install main-bower-files
        gulp.task('replicate')
        change name and repo -> hey-holis  -> RELEASE Replcator
    https://www.npmjs.org/package/gulpshot/

    make better switch between livereload and browserSync

    boubon.io
    http://todomvc.com/
    https://www.npmjs.org/package/gulp-react
    https://www.npmjs.org/package/node-neat
    https://www.npmjs.org/package/node-bourbon
    http://thoughtbot.com/sv/community
    http://laravel-news.com/2014/03/using-bourbon-neat-with-gulp/
    http://todomvc.com/
    http://bitters.bourbon.io/example.html
    http://blog.andyet.com/2014/08/13/opinionated-rundown-of-js-frameworks


    README.md
        npm install -g gulp
        npm install -g bower
        npm install
        bower install
        gem install sass ?

    reduzir dependencies (not lightweight!)
        remove imagemin
        remove bower local

    npm install onchange

    backbone.js
    react

    showdown
    fonts
    templates
    ember

    sourcemaps
    https://github.com/mikestreety/gulp
    https://github.com/klei/gulp-inject
    gulp-combine-media-queries
    gulp.spritesmith
    // gulp.start('styles', 'scripts', 'images');
*/

var DIST            = './dist/';
DIST_CSS            = DIST + 'assets/css/',
DIST_IMG            = DIST + 'assets/img/',
DIST_APP            = DIST + 'assets/js/',
DIST_VENDOR         = DIST + 'assets/vendor/',
DIST_FONT           = DIST + 'assets/fonts/',
DIST_HTML           = DIST;

var SRC             = './src/',
SRC_CSS             = SRC + 'css/',
SRC_SASS            = SRC + 'sass/',
SRC_APP             = SRC + 'app/',
SRC_IMG             = SRC + 'images/',
SRC_FONTS           = SRC + 'fonts/',
SRC_HTML            = SRC + 'html/',
SRC_VENDOR          = './bower_components/';

var VENDOR_PATH     = 'assets/vendor/';

var pkg             = require("./package.json");

var gulp            = require('gulp');
var gutil           = require('gulp-util');
var sass            = require('gulp-ruby-sass');
var autoprefixer    = require('gulp-autoprefixer');
var minifycss       = require('gulp-minify-css');
var jshint          = require('gulp-jshint');
var uglify          = require('gulp-uglify');
var rename          = require('gulp-rename');
var concat          = require('gulp-concat');
var notify          = require('gulp-notify');
var refresh         = require('gulp-livereload');
var minifyhtml      = require('gulp-minify-html');
var wiredep         = require('wiredep').stream;
var debug           = require('gulp-debug');
var runSequence     = require('run-sequence');
var lr              = require('tiny-lr');
var http            = require('http');
var path            = require('path');
var ecstatic        = require('ecstatic');
var htmlreplace     = require('gulp-html-replace');
var plumber         = require('gulp-plumber');
var browserSync     = require('browser-sync');
var gulpif          = require('gulp-if');
var size            = require('gulp-size');
var debug           = require('gulp-debug');
var rimraf          = require('gulp-rimraf');
var replace         = require('gulp-replace');
var es              = require('event-stream');
var bourbon         = require('node-bourbon');

// var imagemin        = require('gulp-imagemin');
// var preprocess      = require('gulp-preprocess');
// var cache           = require('gulp-cache');

var mainBowerFiles  = require('main-bower-files');
var bower           = require('bower');


// filters
var gulpFilter      = require('gulp-filter');
var jsFilter        = gulpFilter('**/*.js');
var sassFilter      = gulpFilter('**/*.scss');
var cssFilter       = gulpFilter('**/*.css');

// livereload
var tlr             = lr();
var serverPort      = 3000;
var livereloadPort  = 35729;

gulp.task('help', function(next) {
  gutil.log('--- ' + pkg.name + ' ---');
  gutil.log('--- version: ' + pkg.version );
  gutil.log('--- author: ' + pkg.author );
  gutil.log('');
  gutil.log('See all of the available tasks:');
  gutil.log('$ gulp -T');
  gutil.log('');
  gutil.log('Run a DEV mode server with BrowserSync (default):');
  gutil.log('$ gulp');
  gutil.log('');
  // gutil.log('Run a DEV mode server with LiveReload:');
  // gutil.log('$ gulp --sync lr');
  // gutil.log('');
  gutil.log('Run a PROD mode server with BrowserSync (default):');
  gutil.log('$ gulp dist');
  // gutil.log('Run a PROD mode server with LiveReload:');
  // gutil.log('$ gulp dist --sync lr');
});


var livereload = function (evt, filepath) {
    tlr.changed({
        body: {
            files: path.relative(__dirname, filepath)
        }
    });
    gutil.log(evt, filepath, '> ', path.relative(__dirname, filepath) );
};

// Reload all Browsers
gulp.task('bs-reload', function () {
    browserSync.reload({stream:true});
})

var sync = {};

sync.set = function() {
    sync.mode = (!gutil.env.sync) ? 'bs' : gutil.env.sync;
};
sync.isLivereload = function() {
    if (sync.mode == 'lr') return true;
};
sync.init = function(){
    // gulp --sync lr
    if (sync.mode == 'lr') {
        // livereload
        tlr.listen(livereloadPort);
        gutil.log(gutil.colors.blue('LiveReload Server listening on port '+ livereloadPort));

    // gulp --sync bs
    } else if (sync.mode == 'bs') {
        // gutil.beep();
        // browserSync
        // http://www.browsersync.io/docs/options/
        browserSync.init([
                SRC_CSS  + '**/*.css',
                SRC_SASS + '**/*.scss',
                SRC_HTML + '**/*.html',
                SRC_APP  + '**/*.js'
            ],
            {
            server: {
                baseDir: './dist/'
            },
            index     : 'index.html',
            debugInfo : true,
            notify    : true,
            open      : false,
            ghostMode : {
                clicks   : true,
                location : true,
                forms    : true,
                scroll   : true
            },
            // proxy: "local.dev",
            port: serverPort
        });
    }
};

// http://www.mikestreety.co.uk/blog/an-advanced-gulpjs-file
// https://github.com/mikestreety/gulp
var changeEvent = function(evt) {
    // gutil.log('File', gutil.colors.cyan(evt.path.replace(new RegExp('/.*(?=/' + basePaths.src + ')/'), '')), 'was', gutil.colors.magenta(evt.type));
};

// install sass in order to wor!
// $ gem install sass
gulp.task('dev:style', function() {
    var cssFiles  = gulp.src( SRC_CSS + '**/*.css' );
    var sassFiles =
        gulp.src( SRC_SASS + '**/*.scss' )
            .pipe(sass({
                style     : 'expanded',
                sourcemap : false
            }))
            .on('error', gutil.log);

    return es.concat(cssFiles, sassFiles)
        // .pipe(debug({verbose: true}))
        .pipe(plumber())
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(size())
        .pipe(concat('all.css'))
        .pipe(gulp.dest( DIST_CSS ));

        browserSync.reload({stream:true});
        // .pipe(gulpif(sync.isLivereload, refresh(tlr), browserSync.reload({stream:true})));
        // .pipe(notify({ message: 'css task complete' }));
});

gulp.task('dist:style', function() {
    var cssFiles  = gulp.src( SRC_CSS + '**/*.css' );

    console.log(cssFiles);

    var sassFiles =
        gulp.src( SRC_SASS + '**/*.scss' )
            .pipe(sass({
                style     : 'compressed',
                sourcemap : false
            }))
            .on('error', gutil.log);

    return es.concat(cssFiles, sassFiles)
        // .pipe(debug({verbose: true}))
        .pipe(plumber())
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(minifycss())
        .pipe(size())
        .pipe(concat('all.css'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest( DIST_CSS ));

        browserSync.reload();
        // .pipe(gulpif(sync.isLivereload, refresh(tlr), browserSync.reload({stream:true})));
        // .pipe(notify({ message: 'css task complete' }));
});


gulp.task('dev:html', function () {

    return gulp.src( SRC_HTML + '**/*.html' )
        // .pipe(debug({verbose: true}))
        .pipe(wiredep({
            ignorePath: '../../bower_components/',
            exclude: [ /html5shiv/, /respond/ ],
            dependencies: true,
            devDependencies: false,
            fileTypes: {
                html: {
                    block: /(([ \t]*)<!--\s*bower:*(\S*)\s*-->)(\n|\r|.)*?(<!--\s*endbower\s*-->)/gi,
                    detect: {
                        js: /<script.*src=['"](.+)['"]>/gi,
                        css: /<link.*href=['"](.+)['"]/gi
                    },
                    replace: {
                        js: '<script src="'+ VENDOR_PATH + '{{filePath}}"></script>',
                        css: '<link rel="stylesheet" href="'+ VENDOR_PATH + '{{filePath}}" />'
                    }
                }
            }
        }))
        .pipe(wiredep({
            ignorePath: '../../bower_components/',
            exclude: [
                /^(?:(?!respond|html5shiv).)*$/
            ],
            dependencies: true,
            devDependencies: false,
            overrides: {
                'respond': {
                  'main': [
                    "./dest/respond.min.js"
                  ]
                },
                'html5shiv': {
                  'main': [
                    './dist/html5shiv.min.js'
                  ]
                }
            },
            fileTypes: {
                html: {
                    block: /(([ \t]*)<!--\s*ieonly:*(\S*)\s*-->)(\n|\r|.)*?(<!--\s*endieonly\s*-->)/gi,
                    detect: {
                        js: /<script.*src=['"](.+)['"]>/gi
                    },
                    replace: {
                        js: '<!--[if lt IE 9]><script src="'+ VENDOR_PATH + '{{filePath}}"></script><![endif]-->',
                    }
                }
            },
        }))
        .pipe(htmlreplace({
            'allcss' : 'assets/css/all.css',
            'appjs'  : 'assets/js/app.js'
        }))
        .pipe(size())
        .pipe(gulp.dest( DIST_HTML ));

        browserSync.reload();

        // todo: make better switch between livereload and browserSync
        // .pipe(gulpif(sync.isLivereload, refresh(tlr), browserSync.reload({stream:true})));
        // .pipe(notify({ message: 'html task complete' }));
});


gulp.task('dist:html', function() {
    return gulp.src( SRC_HTML + '**/*.html' )
        .pipe(wiredep({
            ignorePath: '../../bower_components/',
            exclude: [
                /^(?:(?!respond|html5shiv).)*$/
            ],
            dependencies: true,
            devDependencies: false,
            overrides: {
                'respond': {
                  'main': [
                    "./dest/respond.min.js"
                  ]
                },
                'html5shiv': {
                  'main': [
                    './dist/html5shiv.min.js'
                  ]
                }
            },
            fileTypes: {
                html: {
                    block: /(([ \t]*)<!--\s*ieonly:*(\S*)\s*-->)(\n|\r|.)*?(<!--\s*endieonly\s*-->)/gi,
                    detect: {
                        js: /<script.*src=['"](.+)['"]>/gi
                    },
                    replace: {
                        js: '<!--[if lt IE 9]><script src="'+ VENDOR_PATH + '{{filePath}}"></script><![endif]-->',
                    }
                }
            },
        }))
        .pipe(htmlreplace({
            'vendorcss' : 'assets/vendor/all-vendor.min.css',
            'vendorjs'  : 'assets/vendor/all-vendor.min.js',
            'allcss'    : 'assets/css/all.min.css',
            'appjs'     : 'assets/js/app.min.js'
        }))
        .pipe(replace(/(([ \t]*)<!--\s*bower:*(\S*)\s*-->)(\n|\r|.)*?(<!--\s*endbower\s*-->)/gi, ''))
        .pipe(replace(/\<\!\-\-\ ieonly\:js\ \-\-\>/, ''))
        .pipe(replace(/\<\!\-\-\ endieonly\ \-\-\>/, ''))
        .pipe(minifyhtml({
            comments     : true,
            conditionals : true,
            empty        : true,
            spare        : true,
            quotes       : true
        }))
        .pipe(gulp.dest( DIST_HTML ));

        browserSync.reload();
        // .pipe(gulpif(sync.isLivereload, refresh(tlr), browserSync.reload()));
});



gulp.task('dev:app', function() {
    return gulp.src([
            SRC_APP + '**/*.js'
        ])
        // .pipe(debug({verbose: true}))
        // .pipe(plumber())
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'))
        .pipe(concat('app.js'))
        .pipe(gulp.dest( DIST_APP ));

        browserSync.reload();
        // .pipe(gulpif(sync.isLivereload, refresh(tlr), browserSync.reload({stream:true})));
        // .pipe(notify({ message: 'app task complete' }));
});

gulp.task('dist:app', function() {
    return gulp.src([
            SRC_APP + '**/*.js'
        ])
        .pipe(concat('app.js'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
        .pipe(size())
        .pipe(gulp.dest( DIST_APP ));
        browserSync.reload();
        // .pipe(gulpif(sync.isLivereload, refresh(tlr), browserSync.reload({stream:true})));
        // .pipe(notify({ message: 'app task complete' }));
});

gulp.task('dev:img', function() {
    return gulp.src( SRC_IMG + '**/*')
        .pipe(plumber())
        .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
        .pipe(size())
        .pipe(gulp.dest( DIST_IMG ));
        browserSync.reload();
        // .pipe(gulpif(sync.isLivereload, refresh(tlr), browserSync.reload({stream:true})));
        // .pipe(notify({ message: 'images task complete' }));
});

gulp.task('dist:img', function() {
    return gulp.src( SRC_IMG + '**/*')
        .pipe(plumber())
        .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
        .pipe(size())
        .pipe(gulp.dest( DIST_IMG ));
        browserSync.reload();
        // .pipe(gulpif(sync.isLivereload, refresh(tlr), browserSync.reload({stream:true})));
        // .pipe(notify({ message: 'images task complete' }));
});


gulp.task('all-vendor', function() {

        return gulp.src( mainBowerFiles({
            paths: {
                bowerDirectory : './bower_components',
                debugging      : true
            }
        }), { base: './bower_components' } )

        .pipe(jsFilter)
        .pipe(concat('all-vendor.js'))
        // .pipe(gulp.dest(DIST_VENDOR))
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(DIST_VENDOR))

        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe(concat('all-vendor.css'))
        // .pipe(gulp.dest(DIST_VENDOR))
        .pipe(minifycss())
        .pipe(rename({ suffix: '.min' }))
        .pipe(size())
        .pipe(gulp.dest(DIST_VENDOR))

        .pipe(cssFilter.restore())
        .pipe(size())
        .pipe(gulp.dest(DIST_VENDOR));
});

gulp.task('bower-files', function(){

    return gulp.src( mainBowerFiles({
        paths: {
            bowerDirectory : './bower_components',
            debugging      : true
        }
    }), { base: './bower_components' } )
    .pipe(gulp.dest( DIST_VENDOR ))
});

// Updates the Bower dependencies based on the bower.json file
gulp.task('bower-update', function(next) {

    var needsUpdate = false;

    gulp.src('bower.json')
        .pipe(require('gulp-newer')('.build'))
        .pipe(gulp.dest('.build')) // todo: don't do this if the bower install fails
    .on('close', function() {
        if (!needsUpdate) {
            next();
        }
    })
    .on('error', function(error) {
        if (!needsUpdate) {
            next(error);
        }
    })
    .on('data', function() {
        // updated bower.json
        needsUpdate = true;
        gutil.log('Updating Bower Dependencies');
        bower.commands.install([], {}, {
            interactive: false
        })
        .on('end', function() {
            gutil.log('Bower Dependencies Updated');
            next();
        })
        .on('log', function(log) {
            if (log.level == 'action' && log.id == 'install') {
                gutil.log('Added Bower Dependency: ' + log.message);
            }
        })
        .on('error', function(error) {
            gutil.error('Bower Error:', error);
            next(error);
        });
    })
});

// Clean the DIST dir
gulp.task('clean', function() {
    return gulp.src([DIST, '.build'], {read: false})
        .pipe(rimraf());
});


gulp.task('default', ['dev'], function() {

    gutil.log(gutil.colors.red('---------------------------------'));
    gutil.log(gutil.colors.green('heyholis building: dev'));

    if (sync.isLivereload()) {
        http.createServer(ecstatic({
            root      : __dirname + '/dist',
            defaultExt: 'html',
            autoIndex : true
        })).listen(serverPort);
        gutil.log(gutil.colors.blue('HTTP server listening on port ' + serverPort));
    }

    sync.init();

    gulp.watch([
        SRC_CSS  + '/**/*.css',
        SRC_SASS + '/**/*.scss'
    ], ['dev:style']);
    gulp.watch( SRC_APP + './**/*.js',    ['dev:app']);
    gulp.watch( SRC_HTML + './**/*.html', ['dev:html']);
});

gulp.task('dist', ['build-dist'], function() {

    gutil.log(gutil.colors.green('heyholis building: dist'));

    if (sync.isLivereload()) {
        http.createServer(ecstatic({
            root: __dirname + '/dist',
            defaultExt: 'html',
            autoIndex : true
        })).listen(serverPort);
        gutil.log(gutil.colors.blue('HTTP server listening on port ' + serverPort));
    }

    sync.init();

    gulp.watch([
        SRC_CSS + './**/*.css',
        SRC_SASS + './**/*.scss'
    ], ['dist:style']);
    gulp.watch( SRC_HTML + './**/*.html', ['dist:html']);
    gulp.watch( SRC_APP + './**/*.js',    ['dist:app']);
});

gulp.task('dev', function(callback) {

    sync.set();

    runSequence(
        'clean',
        'bower-files',
        'dev:html',
        'dev:app',
        'dev:style',
        // 'dev:img',
        callback
    );
});

gulp.task('build-dist', function(callback) {

    sync.set();

    runSequence(
        'clean',
        'all-vendor',
        'dist:app',
        'dist:style',
        // 'dist:img',
        'dist:html',
        callback
    );
});


