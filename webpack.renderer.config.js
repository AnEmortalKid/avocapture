const rules = require('./webpack.rules');
const path = require("path");
const fs = require("fs");

const CopyPlugin = require("copy-webpack-plugin");

const assets = ["css"];

const assetPatterns = assets.map((asset) => {
  return {
    from: path.resolve(__dirname, "src", "assets", asset),
    to: path.resolve(__dirname, ".webpack/renderer", asset),
  };
});

const faPath = path.resolve(__dirname, "src", "assets", "font-awesome-4.7.0");
fs.readdirSync(faPath).forEach((f) => {
  assetPatterns.push(
    {
      from: path.join(faPath, f),
      to: path.resolve(__dirname, ".webpack/renderer", "font-awesome-4.7.0", f)
    }
  )
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
  externals: {
    "node-global-key-listener": "node-global-key-listener",
  },
};
