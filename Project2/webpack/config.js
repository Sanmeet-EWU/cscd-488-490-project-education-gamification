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
        filename: "[name].bundle.js"
    },
    devServer: {
        static: path.resolve(process.cwd(), "dist"),
        hot: false,
        liveReload: true,
        open: true,
        watchFiles: ['src/**/*', 'public/**/*'],
        historyApiFallback: {
            rewrites: [
                { from: /^\/game.html$/, to: '/game.html' },
                { from: /./, to: '/index.html' }
            ]
        },
        devMiddleware: {
            writeToDisk: true,
        },
        headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
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
                test: /\.(gif|png|jpe?g|svg|xml|glsl|mp3)$/i, // Explicitly include mp3
                use: "file-loader"
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({ template: "./index.html", filename: "index.html" }),
        new HtmlWebpackPlugin({ template: "./game.html", filename: "game.html" }),

        new CopyWebpackPlugin({
            patterns: [
                { from: "public", to: "public" },
                { from: "public/assets", to: "assets" },
                { from: "public/assets/ui", to: "assets/ui" },
                { from: "public/assets/StartScreen", to: "assets/StartScreen" },
                { from: "public/assets/audio", to: "assets/audio" }, // Ensure audio folder is copied
                { from: "public/style.css", to: "style.css" },
                { from: "public/site.webmanifest", to: "site.webmanifest" },
                { from: "public/favicon", to: "favicon" },
                { from: "public/assets/portraits", to: "assets/portraits" },
                { from: "public/assets/fonts", to: "font" },
                { from: "public/assets/characters", to: "assets/characters" },
                { from: "src/SceneDialogue", to: "SceneDialogue" }
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