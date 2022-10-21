const {merge} = require('webpack-merge')
const dev = require('./webpack.dev')
const {paths} = require("./config");

module.exports = merge(dev, {
    entry: [paths.web + '/web.js']
});