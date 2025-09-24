import { Configuration } from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin'
import * as path from "path";
// const path = require("path");

const rootDir = __dirname + "/../src";
const viewDir = path.resolve(rootDir, "react-view");
const serverDir = path.resolve(rootDir, "..");

const isProduction = process.env.NODE_ENV == "production" || false;
const hash = isProduction ? ".[chunkhash]" : "";

const config: Configuration = {
    entry: {
        main: path.resolve(viewDir, "index.tsx"),
    },
    output: {
        path: path.resolve(serverDir, "Public"),
        filename: `react/[name]${hash}.js`,
        publicPath: "/",
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                resolve: {
                    fullySpecified: false,
                },
            },
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.scss$/i,
                exclude: [/node_modules/],
                use: ["style-loader", "css-loader", "sass"],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(viewDir, "index.html"),
            filename: path.resolve(serverDir, "Resources/Views/react.leaf"),
        }),
        new NodePolyfillPlugin({})
    ],
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    optimization: {
        splitChunks: {
            chunks: "all",
        },
    },
    devtool: "source-map",
    stats:{
        errorDetails: true
    }
};

export default config;
