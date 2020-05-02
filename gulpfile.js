const { src, dest, watch, series } = require(`gulp`);
const htmlCompressor = require(`gulp-htmlmin`);
const jsCompressor = require(`gulp-uglify`);
const babel = require(`gulp-babel`);
const jsLinter = require(`gulp-eslint`);
const csslint = require(`gulp-csslint`);
const htmlValidator = require(`gulp-html`);
const browserSync = require(`browser-sync`);
const reload = browserSync.reload;

let compressHTML = () => {
    return src(`html/*.html`)
        .pipe(htmlCompressor({collapseWhitespace: true}))
        .pipe(dest(`prod`));
};
let validateHTML = () => {
    return src(`html/*.html`)
        .pipe(htmlValidator());
};
let validateJSProd = () => {
    return src(`js/*.js`)
        .pipe(babel())
        .pipe(jsCompressor())
        .pipe(dest(`prod/scripts`));
};
let validateJSDev = () =>{
    return src(`js/*.js`)
        .pipe(babel())
        .pipe(dest(`temp/scripts`));
};


let lintJS = () => {
    return src(`js/*.js`)
        .pipe(jsLinter())
        .pipe(jsLinter.formatEach(`compact`, process.stderr));

};
let validateCSSDev = () =>{
    return src(`css/*.css`)
        .pipe(csslint())
        .pipe(csslint.formatter())
        .pipe(csslint.formatter(`fail`))
        .pipe(dest(`temp/styles`));
};
let validateCSSProd = () => {
    return src(`css/*.css`)
        .pipe(csslint())
        .pipe(csslint.formatter())
        .pipe(csslint.formatter(`fail`))
        .pipe(dest(`prod/styles`));
};
let serve = () => {
    browserSync({
        notify: true,
        reloadDelay: 0, // A delay is sometimes helpful when reloading at the
        server: {       // end of a series of tasks.
            baseDir: [
                `temp`,
                `html`
            ]
        }
    });
    watch(`css/*.css`,
        series(validateCSSDev)
    ).on(`change`, reload);

    watch(`js/*.js`,
        series(lintJS, validateJSDev)
    ).on(`change`, reload);

    watch(`html/*.html`,
        series(validateHTML)
    ).on(`change`, reload);
};
exports.compressHTML = compressHTML;
exports.validateHTML = validateHTML;
exports.validateJSProd = validateJSProd;
exports.validateJSDev = validateJSDev;
exports.lintJS = lintJS;
exports.validateCSSProd = validateCSSProd;
exports.validateCSSDev = validateCSSDev;
exports.serve = series(validateCSSDev, lintJS, validateJSDev, validateHTML, serve);
exports.build = series(compressHTML, validateJSProd, validateCSSProd);
