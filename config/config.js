const packageInfo = require('../package.json');

/**
 * Banner
 */
const bannerConfig = {
    banner: `
/**!
 * ${packageInfo.prettyName} v${packageInfo.version}
 * @author ${packageInfo.author.name}
 * @homepage ${packageInfo.homepage}
 * @license ${packageInfo.license} ${new Date().getFullYear()}
 */`,
    raw: true
};


/**
 * Paths
 */
const path = require('path');
const paths = { // Source files
    src: path.resolve(__dirname, '../src'),
    entry: path.resolve(__dirname, '../src/_index.js'),

    // Production build files
    dist: path.resolve(__dirname, '../dist'),

    // Web resources
    web: path.resolve(__dirname, '../web'),

    // Build web
    build: path.resolve(__dirname, '../build'),

    // Static files that get copied to build folder
    public: path.resolve(__dirname, '../public'),
};


/**
 * Export
 */
module.exports = {
    paths,
    packageInfo,
    bannerConfig
};