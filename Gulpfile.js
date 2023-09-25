/* eslint-disable no-console */

"use strict";

/** **************************************
    DEPENDENCIES
**************************************** */
/*
 * This list of dependency variables comes from the package.json file.
 * Ensure any dependency listed here is also added to package.json.
 * These variables are declared here at the top and are used throughout
 * the gulpfile to complete certain tasks and add functionality.
 */
const autoprefixer = require("autoprefixer");
const browsersync = require("browser-sync").create();
const concat = require("gulp-concat");
const cssnano = require("cssnano");
const gulp = require("gulp");
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");
const notify = require("gulp-notify");
const plumber = require("gulp-plumber");
const postcss = require("gulp-postcss");
const rename = require("gulp-rename");
const gulpSass = require("gulp-sass");
const shell = require("gulp-shell");
const sourcemaps = require("gulp-sourcemaps");
const uglify = require("gulp-uglify");
// Docs
const sassdoc = require("sassdoc");
const jsdoc = require("gulp-jsdoc3");
const { exec } = require("child_process");
const template = require("gulp-template");
const webserver = require("gulp-webserver");
const filesystem = require("file-system");
const copy = require("gulp-copy");
const dartSass = require("sass");
const sass = gulpSass(dartSass);

/** **************************************
    SOURCE PATHS
**************************************** */
/**
 * The 'config' object defines where all the assets are found.
 * Changing the values of this object will change where all the tasks below look for files
 */

// Common defaults
const pathSrc = "./assets/src/";
const pathDist = "./assets/dist/";

// Pathing config
const config = {
  theme: {
    name: "theme", // if you change this value, update your file enqueue's too. This is a prefix for all file names (usage example: config.theme.name)
  },
  css: {
    sass: `${pathSrc}sass/style.scss`,
    sassComps: `${pathSrc}sass/**/*.scss`,
    sassBlocks: "./template-parts/blocks/_assets/blocks-imports.scss",
    sassBlocksComps: "./template-parts/**/**/*.scss",
    plainSrc: `${pathSrc}css/*.css`,
    vendorSrc: `${pathSrc}vendor/css/**/*.css`,
    dist: `${pathDist}css/`,
  },
  js: {
    src: [
      `${pathSrc}js/**/*.js`, // Wildcard - Used as a catch-all. This will add all .js files located within assets/src/js/ to be compiled.
      // pathSrc + 'js/main.js', // Manual - FOR DEPENDENCIES
      // if you want to control your enqueue order, manually add each file in the order you'd like
    ],
    srcBlocks: [
      "./template-parts/blocks/**/*.js", // Wildcard - Used as a catch-all. This will add all .js files located within assets/src/js/ to be compiled.
      // './template-parts/blocks/custom-content/custom-content.js', // Manual - FOR DEPENDENCIES
      // if you want to control your enqueue order, manually add each file in the order you'd like
    ],
    srcVendor: [
      `${pathSrc}vendor/js/**/*.js`, // Wildcard - used as a catch-all. This will add all .js files located within assets/src/vendor/js/ to be compiled and minfied.
      // pathSrc + 'vendor/js/slick.js', // Manual - FOR DEPENDENCIES
      // if you want to control your enqueue order, manually add each file in the order you'd like
    ],
    dist: `${pathDist}js/`,
  },
  imgs: {
    srcCss: [
      `${pathSrc}imgs/css/*.jpg`,
      `${pathSrc}imgs/css/*.jpeg`,
      `${pathSrc}imgs/css/*.png`,
      `${pathSrc}imgs/css/*.gif`,
      `${pathSrc}imgs/css/*.svg`,
    ],
    distCss: `${pathDist}css/`,
    src: [
      `${pathSrc}imgs/*.jpg`,
      `${pathSrc}imgs/*.jpeg`,
      `${pathSrc}imgs/*.png`,
      `${pathSrc}imgs/*.gif`,
      `${pathSrc}imgs/*.svg`,
    ],
    dist: `${pathDist}imgs/`,
  },
  fonts: {
    src: [`${pathSrc}fonts/*.woff`, `${pathSrc}fonts/*.woff2`],
    dist: `${pathDist}`,
  },
  docs: {
    index: "./assets/src/docs/index.html",
    serve: "./docs/",
  },
};

const jsDocConfig = "./assets/src/docs/jsdoc.json";

/** **************************************
    STANDARD TASKS
**************************************** */

/**
 * COMPILE GLOBAL SASS :: UN-MINIFIED & MINIFIED
 */
function styles() {
  // Define plugins for "PostCSS"
  const pluginsExpanded = [autoprefixer()];
  const pluginsMin = [cssnano()];

  // Run SASS Task
  return (
    gulp
      .src(config.css.sass)
      .pipe(
        plumber(
          {
            errorHandler: notify.onError(
              "SASS Global Error: <%= error.message %>"
            ),
          } // on error, send push
        )
      )
      .pipe(sourcemaps.init()) // Begin SCSS mapping
      .pipe(
        sass({
          outputStyle: "expanded",
        })
      )
      .pipe(postcss(pluginsExpanded))
      .pipe(sourcemaps.write()) // Write SCSS maps
      .pipe(rename(`${config.theme.name}-custom.css`))
      .pipe(gulp.dest(config.css.dist)) // DIST un-minified file

      // minify for production
      .pipe(rename(`${config.theme.name}-custom.min.css`)) // rename with .min
      .pipe(postcss(pluginsMin)) // minify
      .pipe(gulp.dest(config.css.dist))
  ); // DIST minified version
}

/**
 * COMPILE & MINIFY PLAIN CSS
 */
function stylesPlain() {
  return gulp
    .src(config.css.plainSrc)
    .pipe(
      plumber(
        {
          errorHandler: notify.onError("Plain CSS Error: <%= error.message %>"),
        } // on error, send push
      )
    )
    .pipe(gulp.dest(config.css.dist)) // DIST un-minified file
    .pipe(
      rename((path) => {
        // eslint-disable-next-line no-param-reassign
        path.extname = ".min.css";
      })
    )
    .pipe(postcss([cssnano()])) // minify
    .pipe(gulp.dest(config.css.dist)); // DIST minified version
}

/**
 * COMPILE & MINIFY VENDOR & MISC CSS
 */
function stylesVendor() {
  return gulp
    .src(config.css.vendorSrc)
    .pipe(
      plumber(
        {
          errorHandler: notify.onError(
            "Vendor CSS Error: <%= error.message %>"
          ),
        } // on error, send push
      )
    )
    .pipe(concat(`${config.theme.name}-vendor.min.css`)) // group files together
    .pipe(postcss([cssnano()])) // minify
    .pipe(gulp.dest(config.css.dist)); // DIST minified version
}

/**
 * COMPILE CUSTOM JS :: UN-MINIFIED & MINIFIED
 */
function scriptsGlobal() {
  return (
    gulp
      .src(config.js.src)
      .pipe(
        plumber(
          {
            errorHandler: notify.onError(
              "JS Global Error: <%= error.message %>"
            ),
          } // on error, send push
        )
      )
      .pipe(concat(`${config.theme.name}-custom.js`)) // group files together
      .pipe(gulp.dest(config.js.dist)) // DIST un-minified file

      // minify for production
      .pipe(rename(`${config.theme.name}-custom.min.js`)) // rename with .min
      .pipe(uglify()) // minify
      .pipe(gulp.dest(config.js.dist))
  ); // DIST minified version
}

/**
 * COMPILE CUSTOM BLOCKS JS :: UN-MINIFIED & MINIFIED
 */
function scriptsBlocks() {
  return (
    gulp
      .src(config.js.srcBlocks)
      .pipe(
        plumber(
          {
            errorHandler: notify.onError(
              "JS Blocks Error: <%= error.message %>"
            ),
          } // on error, send push
        )
      )
      .pipe(concat(`${config.theme.name}-custom-blocks.js`)) // group files together
      .pipe(gulp.dest(config.js.dist)) // DIST un-minified file

      // minify for production
      .pipe(rename(`${config.theme.name}-custom-blocks.min.js`)) // rename with .min
      .pipe(uglify()) // minify
      .pipe(gulp.dest(config.js.dist))
  ); // DIST minified version
}

/**
 * COMPILE & MINIFY VENDOR JS
 */
function scriptsVendor() {
  return (
    gulp
      .src(config.js.srcVendor)
      .pipe(
        plumber(
          {
            errorHandler: notify.onError(
              "Vendor JS Error: <%= error.message %>"
            ),
          } // on error, send push
        )
      )
      .pipe(concat(`${config.theme.name}-vendor.js`)) // group files together
      .pipe(gulp.dest(config.js.dist)) // DIST un-minified file

      // minify for production
      .pipe(rename(`${config.theme.name}-vendor.min.js`)) // rename with .min
      .pipe(uglify()) // minify
      .pipe(gulp.dest(config.js.dist))
  ); // DIST minified version
}

/**
 * OPTIMIZE IMAGES & DIST TO THEME
 */
function images() {
  return gulp
    .src(config.imgs.src)
    .pipe(
      plumber(
        { errorHandler: notify.onError("Images Error: <%= error.message %>") } // on error, send push
      )
    )
    .pipe(newer(config.imgs.dist)) // check DIST for existing assets
    .pipe(
      imagemin([
        // optimize images per image type
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false,
              collapseGroups: true,
            },
          ],
        }),
      ])
    )
    .pipe(gulp.dest(config.imgs.dist)); // DIST optimized versions
}

/**
 * OPTIMIZE IMAGES & DIST TO THEME CSS
 */
function imagesCss() {
  return gulp
    .src(config.imgs.srcCss)
    .pipe(
      plumber(
        { errorHandler: notify.onError("Images Error: <%= error.message %>") } // on error, send push
      )
    )
    .pipe(newer(config.imgs.dist)) // check DIST for existing assets
    .pipe(
      imagemin([
        // optimize images per image type
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false,
              collapseGroups: true,
            },
          ],
        }),
      ])
    )
    .pipe(gulp.dest(config.imgs.distCss)); // DIST optimized versions
}
/**
 * OPTIMIZE FONTS & DIST TO THEME
 */
function fonts() {
  return gulp
    .src(config.fonts.src)
    .pipe(copy(config.fonts.dist, { prefix: 2 }));
}

/** **************************************
    DEFINED TASKS
**************************************** */

/**
 * BROWSER SYNC
 *
 * https://browsersync.io/docs/gulp
 * This will not reload the browser on every change
 * It will just output an IP that is available to any device on the network.
 * Meant for Testing PC and Devices.
 */
function browserSync(done) {
  browsersync.init({
    proxy: "http://wp.test:8888", // replace yoursitename with the url of your local site.
    open: false,
  });
  done();
}

/**
 * COMMAND LINE
 *
 * Define a command to run (you may need to 'cd' into the correct directory first)
 */
let shellCmd = "echo sample commandLine command;";
shellCmd += "echo sample 2nd command;"; // Can be a series of commands seperated by ';'

// Run commandLine var
gulp.task(
  "commandLine",
  shell.task(shellCmd, {
    shell: "bash",
  })
);

/** **************************************
    CUSTOM PROJECT TASKS
**************************************** */
// Define custom tasks for your specific project

/** **************************************
        Doc Generation Tasks
**************************************** */
// Sass documentation generator
function docsSass() {
  const options = {
    dest: `${config.docs.serve}sass`,
  };
  return gulp.src(config.css.sassComps).pipe(sassdoc(options));
}

// JS documentation generator
function docsJs(cb) {
  gulp.src(config.js.src, { read: false }).pipe(jsdoc(jsDocConfig, cb));
  cb();
}
function docsJsBlocks(cb) {
  gulp.src(config.js.srcBlocks, { read: false }).pipe(jsdoc(jsDocConfig, cb));
  cb();
}
// PHP documentation generator
function docsPhp(cb) {
  exec(
    `php phpDocumentor.phar -d . -t ${config.docs.serve}php `,
    (err, stdout, stderr) => {
      console.log(err);
      console.log(stdout);
      console.log(stderr);
    }
  );
  cb();
}
// generate landing page for viewing docs
// create name for landing page based off the name of the theme
let name = __dirname.split("/");
const fileContent = filesystem.readFileSync("./README.md", "utf8");
name = name[name.length - 1];
function docsLanding(cb) {
  gulp
    .src(config.docs.index)
    .pipe(
      template({
        name,
        readMe: fileContent,
        jsLink: `${config.docs.serve}js/index.html`,
        sassLink: `${config.docs.serve}sass/index.html`,
        phpLink: `${config.docs.serve}php/index.html`,
      })
    )
    .pipe(gulp.dest(config.docs.serve));
  cb();
}
// serve site of documentation opens on localhost 8000
function docsServe() {
  gulp.src(config.docs.serve).pipe(
    webserver({
      livereload: true,
      fallback: "index.html",
      open: true,
    })
  );
}

/** *** DOC update and serve TASKS **** */
// Only generates docs, doesn't open server run gulp docserve to serve docs
// use when docs are already served
const updateDocs = gulp.series([docsSass, docsJs, docsPhp]);
// Creates documentation in Docs folder for JS, SASS, and PHP, and then opens webserver to view docs
const document = gulp.series([
  docsSass,
  docsJs,
  docsPhp,
  docsLanding,
  docsServe,
]);

/** **************************************
    ACTIONS
**************************************** */

// BUILD TASK - COMPILES SCSS, CSS & JS, but does NOT watch for file changes
const build = gulp.series([
  stylesVendor,
  stylesPlain,
  styles,
  scriptsVendor,
  scriptsGlobal,
  scriptsBlocks,
  images,
  imagesCss,
  fonts,
]);

// WATCH AND LOG SOURCE FILE CHANGES
function watch() {
  // WATCH SASS / CSS
  gulp.watch(config.css.sass, gulp.series([styles])).on("change", (event) => {
    console.log(`File ${event} was updated, running tasks...`);
  });
  gulp
    .watch(config.css.sassComps, gulp.series([styles]))
    .on("change", (event) => {
      console.log(`File ${event} was updated, running tasks...`);
    });
  gulp
    .watch(config.css.sassBlocks, gulp.series([styles]))
    .on("change", (event) => {
      console.log(`File ${event} was updated, running tasks...`);
    });
  gulp
    .watch(config.css.sassBlocksComps, gulp.series([styles]))
    .on("change", (event) => {
      console.log(`File ${event} was updated, running tasks...`);
    });
  gulp
    .watch(config.css.vendorSrc, gulp.series([stylesVendor]))
    .on("change", (event) => {
      console.log(`File ${event} was updated, running tasks...`);
    });
  gulp
    .watch(config.css.plainSrc, gulp.series([stylesPlain]))
    .on("change", (event) => {
      console.log(`File ${event} was updated, running tasks...`);
    });

  // WATCH JS
  gulp
    .watch(config.js.src, gulp.series([scriptsGlobal]))
    .on("change", (event) => {
      console.log(`File ${event} was updated, running tasks...`);
    });
  gulp
    .watch(config.js.srcBlocks, gulp.series([scriptsBlocks]))
    .on("change", (event) => {
      console.log(`File ${event} was updated, running tasks...`);
    });
  gulp
    .watch(config.js.srcVendor, gulp.series([scriptsVendor]))
    .on("change", (event) => {
      console.log(`File ${event} was updated, running tasks...`);
    });

  // WATCH IMAGES
  gulp.watch(config.imgs.src, gulp.series([images])).on("change", (event) => {
    console.log(`File ${event} was updated, running tasks...`);
  });

  // WATCH IMAGES CSS
  gulp
    .watch(config.imgs.srcCss, gulp.series([imagesCss]))
    .on("change", (event) => {
      console.log(`File ${event} was updated, running tasks...`);
    });
  // WATCH FONTS
  gulp.watch(config.fonts.src, gulp.series([fonts])).on("change", (event) => {
    console.log(`File ${event} was updated, running tasks...`);
  });
}

// DEFAULT GULP TASK
const start = gulp.series([build, watch]);

/** **************************************
    EXPORTS
**************************************** */
// Dev
exports.styles = styles;
exports.stylesPlain = stylesPlain;
exports.stylesVendor = stylesVendor;
exports.scriptsGlobal = scriptsGlobal;
exports.scriptsBlocks = scriptsBlocks;
exports.scriptsVendor = scriptsVendor;
exports.images = images;
exports.imagesCss = imagesCss;
exports.browserSync = browserSync;
exports.build = build;
exports.watch = watch;
exports.default = start;

// Docs
exports.docsSass = docsSass;
exports.docsJs = docsJs;
exports.docsJsBlocks = docsJsBlocks;
exports.docsPhp = docsPhp;
exports.docsLanding = docsLanding;
exports.docsServe = docsServe;
exports.updateDocs = updateDocs;
exports.document = document;
