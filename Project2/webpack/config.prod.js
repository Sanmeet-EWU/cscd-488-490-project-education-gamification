const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const Dotenv = require("dotenv-webpack");
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require("webpack");

module.exports = {
    mode: "production",
    entry: "./src/main.js",
    output: {
        path: path.resolve(process.cwd(), "dist"),
        filename: "bundle.min.js"
    },
    devtool: false,
    performance: {
        maxEntrypointSize: 2500000,
        maxAssetSize: 1200000
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: { loader: "babel-loader" }
            },
            {
                test: [/\.vert$/, /\.frag$/],
                use: "raw-loader"
            },
            {
                test: /\.(gif|png|jpe?g|svg|xml|glsl|woff2|woff|ttf|eot)$/i,
                use: "file-loader"
            }
        ]
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    output: { comments: false }
                }
            })
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new webpack.DefinePlugin({
            "process.env": JSON.stringify(process.env), // Expose environment variables
            "typeof CANVAS_RENDERER": JSON.stringify(true),
            "typeof WEBGL_RENDERER": JSON.stringify(true),
            "typeof WEBGL_DEBUG": JSON.stringify(false),
            "typeof EXPERIMENTAL": JSON.stringify(false),
            "typeof PLUGIN_3D": JSON.stringify(false),
            "typeof PLUGIN_CAMERA3D": JSON.stringify(false),
            "typeof PLUGIN_FBINSTANT": JSON.stringify(false),
            "typeof FEATURE_SOUND": JSON.stringify(true)
        }),
        new HtmlWebpackPlugin({ template: "./index.html" }),
        new CopyPlugin({
            patterns: [
                { from: "public", to: "public" }, // Copy entire public folder
                { from: "public/assets", to: "assets" }, // Ensure all assets are copied
                { from: "public/assets/ui", to: "assets/ui" }, // UI elements
                { from: "public/assets/StartScreen", to: "assets/StartScreen" }, // Start screen images
                { from: "public/assets/audio", to: "assets/audio" }, // Ensure audio files are copied
                { from: "public/style.css", to: "style.css" }, // Copy CSS separately
                { from: "public/site.webmanifest", to: "site.webmanifest" }, // Ensure webmanifest is included
                { from: "game.html", to: "game.html" },
                {from: "public/favicon", to: "favicon"},
                { from: "public/assets/fonts", to: "font" } // Ensure fonts are copied properly

            ]
        })        
    ]
};