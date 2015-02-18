var fs = require('vinyl-fs'),
    map = require('map-stream');

var pdf = require('html-pdf'),
    nunjucks = require('nunjucks'),
    marked = require('marked');

marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true
});

module.exports.convertToPdf = function (mdFolder, cssFile, destFolder) {
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
        /////////////////
        // PAGE TO PDF //
        /////////////////
        .pipe(map(pageToPdf))
        /////////////
        // TO DEST //
        /////////////
        .pipe(fs.dest('./pdf'));


    function mdToHtml(file, cb) {
        file.contents = new Buffer(marked(file.contents.toString()));
        cb(null, file);
    }

    function htmlToPage(file, cb) {
        nunjucks.render('./templates/index.html', {
            cssFile: cssFile || 'node_modules/github-markdown-css/github-markdown.css',
            html:  file.contents.toString()
        }, function(err, res) {
            if (err) {
                cb(err);
            } else {
                file.contents = new Buffer(res);
                cb(null, file);
            }
        });
    }

    function pageToPdf(file, cb) {
        pdf.create(file.contents.toString()).toBuffer(function (err, res) {
            if (err) {
                cb(err);
            } else {
                file.path = file.path.replace(/\.md$/, '.pdf');
                file.contents = res;
                cb(null, file);
            }
        });
    }
};
