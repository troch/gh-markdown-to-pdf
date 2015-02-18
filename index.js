var fs = require('vinyl-fs'),
    map = require('map-stream');

var pdf = require('html-pdf'),
    nunjucks = require('nunjucks'),
    marked = require('marked');

marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true
});

// var templateHtml = fs.readFileSync('templates/index.html', 'utf8');

fs
    .src('./docs/*.md')
    ////////////////
    // MD to HTML //
    ////////////////
    .pipe(map(function (file, cb) {
        file.contents = new Buffer(marked(file.contents.toString()));
        cb(null, file);
    }))
    //////////////////
    // HTML TO PAGE //
    //////////////////
    .pipe(map(function (file, cb) {
        nunjucks.render('./templates/index.html', {
            cssFile: 'node_modules/github-markdown-css/github-markdown.css',
            html:  file.contents.toString()
        }, function(err, res) {
            if (err) {
                cb(err);
            } else {
                file.contents = new Buffer(res);
                cb(null, file);
            }
        });
    }))
    /////////////////
    // PAGE TO PDF //
    /////////////////
    .pipe(map(function (file, cb) {
        pdf.create(file.contents.toString()).toBuffer(function (err, res) {
            if (err) {
                cb(err);
            } else {
                file.path = file.path.replace(/\.md$/, '.pdf');
                file.contents = res;
                cb(null, file);
            }
        });
    }))
    .on('error', function (err) {
        console.log(err);
        process.exit(1);
    })
    .pipe(fs.dest('./pdf'))
    .on('end', function () {
        process.exit();
    });


   // Q
   //  .nfcall(fs.readdir, 'docs')
   //  .then(function (fileNames) {
   //      ////////////////
   //      // Read files //
   //      ////////////////
   //      return Q.all(
   //          fileNames.map(function (fileName) {
   //              return Q.nfcall(fs.readFile, './docs/' + fileName);
   //          })
   //      );
   //  })
   //  .then(function (files) {
   //      ////////////////////
   //      // Template files //
   //      ////////////////////
   //      return Q.all(
   //          files.map(function (file) {
   //              return Q.nfcall(nunjucks.renderString, templateHtml, {
   //                  cssFile: 'node_modules/github-markdown-css/github-markdown.css',
   //                  html:  marked(file.toString())
   //              });
   //          })
   //      );
   //  })
   //  .then(function (htmlFiles) {
   //      ///////////////
   //      // Write PDF //
   //      ///////////////
   //      return Q.all(
   //          htmlFiles.map(function (htmlFile) {
   //              var p = pdf.create(htmlFile);
   //              console.log(p.toFile);
   //              return Q.nfcall(p.toFile, './pdf/a.pdf');
   //          })
   //      );
   //  })
   //  .then(process.exit)
   //  .catch(function (err) {
   //      console.log(err);
   //      process.exit();
   //  });
