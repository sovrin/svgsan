const path = require('path');
const util = require('util');
const fs = require('fs');
const crypto = require('crypto');

/**
 *
 * @param msg
 */
const log = (msg) => console.log(msg);

/**
 *
 * @param key
 * @param start
 */
const time = (key, start = true) => (
    (start)
        ? console.time(key)
        : console.timeEnd(key)
);

/**
 *
 * @param prefix
 * @param file
 */
const resolve = (prefix, file) => path.resolve(__dirname, `${prefix}/${file}`);

/**
 *
 * @param name
 * @return {string}
 */
const filename = (name) => path.parse(name).name;

/**
 *
 * @param file
 * @return {string}
 */
const dirname = (file) => path.dirname(file);

/**
 *
 * @param file
 * @return {string}
 */
const basename = (file) => path.basename(file);


/**
 *
 * @param name
 */
const extensionname = (name) => path.extname(name);

/**
 *
 * @type {*}
 */
const promisify = util.promisify;

/**
 *
 * @param path
 * @return {Promise}
 */
const read = async (path) => (
    promisify(fs.readFile)(path, 'utf8')
        .then((data) => data)
);


/**
 *
 * @param path
 * @param data
 * @return {Promise}
 */
const write = async (path, data) => (
    promisify(fs.writeFile)(path, data, 'utf8')
        .then(() => true)
        .catch((err) => err)
);

/**
 *
 * @param data
 */
const hash = (data) => (
    crypto
        .createHash('md5')
        .update(data, 'utf8')
        .digest('hex')
);

/**
 *
 * @param path
 * @return {boolean}
 */
const exists = (path) => (
    fs.existsSync(path)
);

/**
 *
 * @param path
 * @return {Promise}
 */
const list = async (path) => (
    promisify(fs.readdir)(path)
);

/**
 *
 * @param path
 * @return {Promise<PromiseLike<T> | Promise<T>>}
 */
const isFolder = async (path) => (
    promisify(fs.stat)(path)
        .then(stat => stat.isDirectory())
        .catch(() => false)
);

module.exports = {
    filename,
    basename,
    extensionname,
    log,
    time,
    write,
    read,
    exists,
    list,
    hash,
    isFolder,
    resolve,
};