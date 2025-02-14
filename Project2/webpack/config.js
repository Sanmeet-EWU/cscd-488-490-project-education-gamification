const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const Dotenv = require("dotenv-webpack");
const path = require("path");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    mode: "development",
    devtool: "eval-source-map",
    entry: { 
        main: "./src/main.js",
        auth: "./src/auth.js",
    },
    output: {
        path: path.resolve(process.cwd(), "dist"),
        filename: "[name].bundle.js" // Separate bundles for each entry
    },
    devServer: {
        static: path.resolve(process.cwd(), "dist"),
        hot: true,
        open: true,
        liveReload: true,
        historyApiFallback: {
            rewrites: [
                { from: /^\/game.html$/, to: '/game.html' },
                { from: /./, to: '/index.html' }
            ]
        }
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
    plugins: [
        new HtmlWebpackPlugin({ template: "./index.html", filename: "index.html" }),
        new HtmlWebpackPlugin({ template: "./game.html", filename: "game.html" }),

        new CopyWebpackPlugin({
            patterns: [
                { from: "public", to: "public" }, // Copy entire public folder
                { from: "public/assets", to: "assets" }, // Ensure all assets are copied
                { from: "public/assets/ui", to: "assets/ui" }, // UI elements
                { from: "public/assets/StartScreen", to: "assets/StartScreen" }, // Start screen images
                { from: "public/assets/audio", to: "assets/audio" }, // Ensure audio files are copied
                { from: "public/style.css", to: "style.css" }, // Copy CSS separately
                { from: "public/site.webmanifest", to: "site.webmanifest" }, // Ensure webmanifest is included
                {from: "public/favicon", to: "favicon"},
                { from: "public/assets/fonts", to: "font" }, // Ensure fonts are copied properly
                { from: "src/SceneDialog", to: "SceneDialog" } // Copies to public folder

            ]
        }),

        new Dotenv({ path: "./.env", safe: true }),
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: [path.join(__dirname, "dist/**/*")]
        }),
        new webpack.DefinePlugin({
            "typeof CANVAS_RENDERER": JSON.stringify(true),
            "typeof WEBGL_RENDERER": JSON.stringify(true),
            "typeof WEBGL_DEBUG": JSON.stringify(true),
            "typeof EXPERIMENTAL": JSON.stringify(true),
            "typeof PLUGIN_3D": JSON.stringify(false),
            "typeof PLUGIN_CAMERA3D": JSON.stringify(false),
            "typeof PLUGIN_FBINSTANT": JSON.stringify(false),
            "typeof FEATURE_SOUND": JSON.stringify(true)
        })
    ]
};
