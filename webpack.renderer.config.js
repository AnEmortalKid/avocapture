const rules = require("./webpack.rules");
const path = require("path");
// const CopyPlugin = require("copy-webpack-plugin");
const assets = ["images", "css"];

const assetPatterns = assets.map((asset) => {
  return {
    from: path.resolve(__dirname, "src", "assets", asset),
    to: path.resolve(__dirname, ".webpack/renderer", asset),
  };
});

rules.push({
  test: /\.css$/,
  use: [{ loader: "style-loader" }, { loader: "css-loader" }],
});

module.exports = {
  plugins: [
    // new CopyPlugin({
    //   patterns: assetPatterns,
    // }),
  ],
  // Put your normal webpack config below here
  module: {
    rules,
  },
};
