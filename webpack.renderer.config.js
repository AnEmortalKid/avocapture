const rules = require('./webpack.rules');
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

const assets = ["css"];

const assetPatterns = assets.map((asset) => {
  return {
    from: path.resolve(__dirname, "src", "assets", asset),
    to: path.resolve(__dirname, ".webpack/renderer", asset),
  };
});

module.exports = {
  plugins: [
    new CopyPlugin({
      patterns: assetPatterns,
    }),
  ],
  // Put your normal webpack config below here
  module: {
    rules,
  },
};
