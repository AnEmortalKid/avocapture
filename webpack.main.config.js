const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main/main.js',
  // Put your normal webpack config below here
  module: {
    rules: require('./webpack.rules'),
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src", "main", "views"),
          to: path.resolve(__dirname, ".webpack/main", "views"),
        },
      ],
    }),
  ]
};
