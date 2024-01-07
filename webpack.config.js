const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const APP_PATH = path.resolve(__dirname, 'src');
const PUBLIC_DIR_PATH = path.resolve(__dirname, 'public');

module.exports = (env, options) => {
    const mode = options.mode || 'development';
    const isProd = mode == "production";
    const config = {
        mode,
        entry: {
            index: APP_PATH + "/index.js",
        },

        output: {
            filename: '[name].bundle.js?[hash]',
            path: path.resolve(__dirname, 'dist'),
            publicPath: '/'
        },

        resolve: {
            extensions: ['.js', '.json'],
            fallback: {
                buffer: require.resolve('buffer/'),
                stream: require.resolve("stream-browserify"),
                assert: require.resolve("assert/"),
                http: require.resolve("stream-http"),
                https: require.resolve("https-browserify"),
                os: require.resolve("os-browserify/browser"),
                url: require.resolve("url/")
            },
        },

        module: {
            rules: [
                { test: /\.(ts|js)x?$/, loader: 'babel-loader', exclude: /node_modules/ },
                {
                    test: /\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        "css-loader"
                    ]
                }
            ],
        },

        plugins: [
            new HtmlWebpackPlugin({
                inject: "body",
                template: path.join(PUBLIC_DIR_PATH, 'index.html'),
            }),
            new MiniCssExtractPlugin({
                filename: "style.css?[hash]",
            }),
            new webpack.ProvidePlugin({
                Buffer: ["buffer", "Buffer"],
                process: "process/browser"
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        context: path.resolve(__dirname, "static/"),
                        from: path.resolve(__dirname, "static/"),
                        to: path.resolve(__dirname, "dist/static/"),
                    }
                ],
            })
        ],

        optimization: {
            minimizer: [
                new CssMinimizerPlugin(),
                new TerserPlugin()
            ],
            minimize: isProd,
        },

        performance: {
            hints: false
        },

        devServer: {
            open: true,
            historyApiFallback: true,
        },
    };

    return config;
}