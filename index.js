
var lib = require('./lib');

lib.convertToPdf()
    .on('error', function (err) {
        console.log(err);
        process.exit(1);
    })
    .on('end', function () {
        process.exit();
    });
