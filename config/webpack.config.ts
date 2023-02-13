import { Configuration } from "webpack";

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const path = require('path');

const rootDir = __dirname + "/../src"
console.log(rootDir)

const isProduction = process.env.NODE_ENV == "production" || false
const hash = isProduction ? ".[chunkhash]" : "";

export default {
    entry:  {
        main: path.resolve(rootDir, 'view/index.tsx')
    },
    mode: isProduction? "production" : 'development',
    output: {
        path: path.resolve(rootDir, '../static'),
        filename: `react/[name]${hash}.js`,
        publicPath: '/',
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(rootDir, './view/index.html'),
            filename: path.resolve(rootDir, '../build/templates/react.hbs'),
            inject: false,
        }),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: `react/[name]${hash}.css`,
            chunkFilename: `react/[id]${hash}.css`,
        }),
    ],
    resolve: {
        extensions: ['.mjs', '.ts', '.tsx', '.js', '.jsx', '.scss'],
        modules: [ 'node_modules' ]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: [
                    /node_modules/,
                ],
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            configFile: path.resolve(rootDir, "../tsconfig.react.json"),
                            transpileOnly: true,
                            experimentalWatchApi: true,
                        }
                    }
                ]
            },
            {
                test: /\.s[ac]ss$/i,
                exclude: [
                    /node_modules/,
                ],
                use: [
                  // Creates `style` nodes from JS strings
                  // 'style-loader',
                  // To extract in separated files
                  MiniCssExtractPlugin.loader,
                  // Translates CSS into CommonJS
                  'css-loader',
                  // Compiles Sass to CSS
                  // 'sass-loader',
                ],
            },
        ]
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
        minimizer: [
            new TerserJSPlugin({}),
            // new OptimizeCSSAssetsPlugin({})
        ],
    },
    devtool: "source-map"
} as Configuration
