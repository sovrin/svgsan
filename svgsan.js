/**
 * SVGSAN - svg sanitizer
 *
 * User: Oleg Kamlowski <oleg.kamlowski@thomann.de>
 * Date: 24.11.2017
 * Time: 11:04
 */

const Svgo = require('svgo');
const cheerio = require('cheerio');

const {
    basename,
    filename,
    time,
    exists,
    hash,
    log,
    write,
    read,
    list,
    isFolder,
    resolve,
    extensionname,
} = require('./utils');

const blacklist = [
    'id', 'class', 'data-name',
];

const svgo = new Svgo();

/**
 *
 * @param data
 * @param path
 * @return {Promise.<void>}
 */
const optimize = async (data, path) => (
    svgo.optimize(data, {path})
);

/**
 *
 * @param data
 * @param file
 * @return {*}
 */
const customize = (data, file) => {
    const $object = cheerio.load(data, {xmlMode: true});
    const purge = (element) => blacklist.forEach(attr => element.attr(attr, null));

    const recurse = ($el) => {
        const children = $el.children();

        children.each((_, child) => {
            const $child = $object(child);

            purge($child);

            if ($child.children().length > 0) {
                return recurse($child);
            }
        });

    };

    recurse($object('*'));
    purge($object('svg'));

    $object('svg').attr('id', filename(file));

    return $object.html();
};

/**
 *
 * @return {Promise.<void>}
 */
const run = async (files, config) => {
    time('sanitize');

    const cache = (exists(config.cacheFile) && config.cache)
        ? require(config.cacheFile)
        : {}
    ;

    const stats = {
        skipped: 0,
        processed: 0,
    };

    try {
        for (let file of files) {
            const source = file;

            file = basename(file);

            const destination = resolve(config.destination, file);
            const content = await read(source);

            if (config.cache) {
                const checksum = hash(content);

                if (!config.force && (exists(destination) && config.cache && (cache[file] && cache[file] === checksum))) {
                    stats.skipped++;

                    continue;
                }

                cache[file] = checksum;
            }

            const optimized = await optimize(content, source);
            const customized = customize(optimized.data, file);

            await write(destination, customized);

            stats.processed++;
        }

        if (config.cache && stats.processed > 0) {
            await write(config.cacheFile, JSON.stringify(cache));
        }
    } catch (e) {
        throw Error(e);
    }

    time('sanitize', false);
    log('total: ' + files.length);
    log('processed: ' + stats.processed);
    log('skipped: ' + stats.skipped);

    process.exit(1);
};

/**
 *
 * @param config
 * @return {Promise<void>}
 */
const sanitize = async (config) => {
    const {source, destination} = config;

    if (!exists(source)) {
        log(`source "${source}" does not exist. aborting`);

        process.exit(1);
    }

    if (!destination || await !isFolder(destination)) {
        log(`destination "${destination}" is not a folder. aborting`);

        process.exit(1);
    }

    isFolder(source)
        .then(state => {
            (state)
                // its either a folder
                ? list(source)
                    .then(files => files.filter(
                        entry => extensionname(entry) === '.svg'),
                    )
                    .then(files => files.map(e => `${source}\\${e}`))
                    .then(files => run(files, config))
                // or a single file
                : run([source], config)
            ;
        })
        .catch((e) => log(e))
    ;
};

module.exports = {
    sanitize,
};
