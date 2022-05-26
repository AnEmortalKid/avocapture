const path = require("path");
const assets = ["images", "css"];

// const assetPatterns = assets.map((asset) => {
//   return {
//     from: path.resolve(__dirname, "src", "assets", asset),
//     to: path.resolve(__dirname, ".webpack/main", asset),
//   };
// });

module.exports = {
  plugins: [
    // new CopyPlugin({
    //   patterns: assetPatterns,
    // }),
  ],
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: "./src/main/main.js",
  // Put your normal webpack config below here
  module: {
    rules: require("./webpack.rules"),
  }
};
