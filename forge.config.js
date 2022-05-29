// If you have set config.forge to a JavaScript file path in package.json:
// Only showing the relevant configuration for brevity
module.exports = {
  plugins: [
    ['@electron-forge/plugin-webpack', {
      mainConfig: './webpack.main.config.js',
      renderer: {
        config: './webpack.renderer.config.js',
        entryPoints: [{
          name: 'main_window',
          html: './src/renderer/index.html',
          js: './src/renderer/main.js',
          preload: {
            "js": "./src/main/preload.js"
          }
        }]
      }
    }],
    // [
    //   "@timfish/forge-externals-plugin",
    //   {
    //     "externals": ["node-global-key-listener"],
    //     "includeDeps": true
    //   }
    // ]
  ],
  makers: [
    {
      name: "@electron-forge/maker-zip",
    },
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "avocapture",
      },
    },
    {
      name: "@electron-forge/maker-deb",
    },
    {
      name: "@electron-forge/maker-rpm",
    },
  ],
}