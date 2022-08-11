const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const fs = require("fs");
// const ZipPlugin = require('zip-webpack-plugin');

const zipper = require('./packager/builtinZipper');

const assets = ["css", "images"];
zipper.zip({
  path: path.resolve(__dirname, ".webpack/main", "builtin"),
  filename: "avocapture-replay-mover.zip",
  pathPrefix: "avocapture-replay-mover",
  exclude: [
    "**/*.md",
    "**/images/**",
    "**/*test.js",
    "**/coverage/**",
  ]
})

const assetPatterns = assets.map((asset) => {
  return {
    from: path.resolve(__dirname, "src", "assets", asset),
    to: path.resolve(__dirname, ".webpack/main", asset),
  };
});

const faPath = path.resolve(__dirname, "src", "assets", "font-awesome-4.7.0");
fs.readdirSync(faPath).forEach((f) => {
  assetPatterns.push({
    from: path.join(faPath, f),
    to: path.resolve(__dirname, ".webpack/main", "font-awesome-4.7.0", f),
  });
});

// TODO zip up rest
// TODO zip without using zipwebpack plugin since it depends on webpack
// and webpack steals require

const zipBuiltins = []

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: "./src/main/main.js",
  // Put your normal webpack config below here
  module: {
    rules: require("./webpack.rules"),
  },
  plugins: [
    new CopyPlugin({
      patterns: assetPatterns,
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src", "main", "views"),
          to: path.resolve(__dirname, ".webpack/main", "views"),
        },
      ],
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(
            __dirname,
            "src",
            "main",
            "extensions",
            "settings",
            "commonPreload.js"
          ),
          to: path.resolve(__dirname, ".webpack/main", "extensions"),
        },
      ],
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "builtin"),
          to: path.resolve(__dirname, ".webpack/main", "builtin"),
          globOptions: {
            ignore: [
              "**/node_modules/**",
              "**/*.md",
              "**/images/**",
              "**/*test.js",
              "**/coverage/**",
            ],
          },
        },
      ],
    }),
    // TODO something using webpack now injected require
    // new ZipPlugin({
    //   path: path.resolve(__dirname, ".webpack/main", "builtin"),
    //   filename: "avocapture-replay-mover.zip",
    //   pathPrefix: "avocapture-replay-mover",
    //   exclude: [
    //     "**/*.md",
    //     "**/images/**",
    //     "**/*test.js",
    //     "**/coverage/**",
    //   ]
    // })
  ],
  externals: {
    forcefocus: "commonjs2 forcefocus"
  },
};
