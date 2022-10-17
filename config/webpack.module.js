const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

const {paths, packageInfo, bannerConfig} = require('./config')

module.exports = {
    mode: 'production',
    devtool: false,
    entry: paths.entry,
    experiments: {
        outputModule: true,
    },
    output: {
        filename: `${packageInfo.name}.module.js`,
        libraryTarget: 'module',
        umdNamedDefine: true,
        // prevent error: `Uncaught ReferenceError: self is not define`
        globalObject: 'this',
    },
    plugins: [
        new webpack.BannerPlugin(bannerConfig)
    ],
    optimization: {
        minimizer: [new TerserPlugin({extractComments: false})],
    },
};