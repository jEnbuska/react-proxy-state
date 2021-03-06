const webpack = require('webpack');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const libPath = path.join(__dirname, 'lib');
const context = path.join(__dirname, 'src');

module.exports = {
    context,
    devtool: 'source-map',
    entry: {// use babel-polyfill to enable new javascript features on old IE:s
        index: ['index.js'],
    },
    output: {
        path: libPath,
        filename: '[name].js',
    },
    resolve: {
        extensions: ['.js', '.jsx'],
        modules: [
            path.RESOLVE(__dirname, 'node_modules'),
            context,
        ],
    }, module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: 'babel-loader',
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin([libPath]),
        new webpack.EnvironmentPlugin({NODE_ENV: 'production'}),
    ],
};
