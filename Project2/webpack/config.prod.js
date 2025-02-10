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
                test: /\.(gif|png|jpe?g|svg|xml|glsl)$/i,
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
        new Dotenv({ path: "./.env", safe: true }),
        new webpack.DefinePlugin({
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
                { from: "public", to: "dist/public" }, // Copy all public assets
                { from: "public/assets", to: "dist/assets" }, // Ensure assets folder is copied
                { from: "public/assets/StartScreen", to: "dist/assets/StartScreen" }, // Copy StartScreen folder explicitly
                { from: "public/favicon", to: "dist/favicon" }, // Ensure full favicon directory is copied
                { from: "public/style.css", to: "dist/style.css" },
                { from: "game.html", to: "dist/game.html" },
                { from: "public/site.webmanifest", to: "dist/site.webmanifest" } // Ensure webmanifest is included
            ]
        })        
    ]
};