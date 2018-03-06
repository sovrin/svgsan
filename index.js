const cli = require('commander');
const {resolve} = require('./utils');
const {sanitize} = require('./svgsan.js');

const pkg = require('./package.json');

cli.version(pkg.version)
    .description('svgsav - svg sanitizer')
;

cli
    .option('-s, --source <source>', 'path or file to process')
    .option('-d, --destination <destination>', 'save to destination')
    .option('-f, --force', 'force customization')
    .option('-n, --no-cache', 'use cache')
;

(process.argv.length === 0) && cli.help();

cli.parse(process.argv);

const {destination, source, force = false, cache} = cli;

sanitize({
    destination,
    source,
    force,
    cache,
    cacheFile: resolve(destination, '_cache.json'),
});