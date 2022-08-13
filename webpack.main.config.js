const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const fs = require("fs");

// zip our extensions up
const zipper = require("./packager/builtinZipper");
const zipBuiltins = [
  "avocapture-replay-mover",
  "avocapture-obs-detector",
  "avocapture-search-on-hotkey",
];

var zipPatterns = [];
for (const builtin of zipBuiltins) {
  console.log("Zipping " + builtin);
  const zipFrom = path.resolve(__dirname, "builtin", builtin);
  const zipTo = path.resolve(__dirname, "builtin", builtin + ".zip");
  zipPatterns.push({
    from: zipTo,
    to: path.resolve(__dirname, ".webpack/main", "builtin", builtin + ".zip"),
  });
  zipper.zip({
    rootDir: zipFrom,
    destination: zipTo,
    exclude: ["*.md", "**/images/**", "*test.js", "**/coverage/**"],
  });
  console.log("Complete!");
}

const assets = ["css", "images"];

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
    // to include npm installables
    // new CopyPlugin({
    //   patterns: [
    //     {
    //       from: path.resolve(__dirname, "builtin"),
    //       to: path.resolve(__dirname, ".webpack/main", "builtin"),
    //       globOptions: {
    //         ignore: [
    //           "**/node_modules/**",
    //           "**/*.md",
    //           "**/images/**",
    //           "**/*test.js",
    //           "**/coverage/**",
    //         ],
    //       },
    //     },
    //   ],
    // }),
    // zips only
    new CopyPlugin({
      patterns: zipPatterns,
    }),
  ],
  externals: {
    forcefocus: "commonjs2 forcefocus",
  },
};
