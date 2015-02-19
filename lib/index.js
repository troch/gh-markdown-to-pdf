var fs = require('vinyl-fs'),
    map = require('map-stream');

var pdf = require('html-pdf'),
    nunjucks = require('nunjucks'),
    marked = require('marked');

// Set marked options
marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true
});

/**
 * Convert md files to pdf files
 * @param  {String|Array} mdFolder     The .md files source
 * @param  {String}       templateFile The template file location
 * @param  {String}       cssFile      The CSS file location
 * @param  {String}       destFolder   The PDF destination folder
 * @param  {String}       htmlFolder   The intermediate HTML folder
 * @return {Object}       A stream
 */
module.exports.convertToPdf = function (mdFolder, templateFile, cssFile, destFolder, htmlFolder) {
    return fs
        .src(mdFolder || './docs/*.md')
        ////////////////
        // MD TO HTML //
        ////////////////
        .pipe(map(mdToHtml))
        //////////////////
        // HTML TO PAGE //
        //////////////////
        .pipe(map(htmlToPage))
        .pipe(fs.dest(htmlFolder || './html'))
        /////////////////
        // PAGE TO PDF //
        /////////////////
        .pipe(map(pageToPdf))
        /////////////
        // TO DEST //
        /////////////
        .pipe(fs.dest('./pdf'));

    /**
     * Convert an vinyl object containing github markdown
     * to a vinyl object containing HTML
     */
    function mdToHtml(file, cb) {
        file.contents = new Buffer(marked(file.contents.toString()));
        cb(null, file);
    }

    /**
     * Convert an vinyl object containing HTML
     * to a vinyl object containing an HTML page
     * using nunjucks
     */
    function htmlToPage(file, cb) {
        nunjucks.render(templateFile || './templates/index.html', {
            cssFile: cssFile || 'node_modules/github-markdown-css/github-markdown.css',
            html:  file.contents.toString()
        }, function(err, res) {
            if (err) {
                cb(err);
            } else {
                file.path = file.path.replace(/\.md$/, '.html');
                file.contents = new Buffer(res);
                cb(null, file);
            }
        });
    }

    /**
     * Convert an vinyl object containing an HTML page
     * to a vinyl object containing a PDF file using html-pdf
     */
    function pageToPdf(file, cb) {
        pdf.create(file.contents.toString()).toBuffer(function (err, res) {
            if (err) {
                cb(err);
            } else {
                file.path = file.path.replace(/\.html$/, '.pdf');
                file.contents = res;
                cb(null, file);
            }
        });
    }
};
