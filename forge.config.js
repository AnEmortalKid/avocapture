
var certConf = {}
if (process.env.WIN_CERT_FILE) {
  certConf.certificateFile = process.env.WIN_CERT_FILE;
}
if (process.env.WIN_CERT_PASS) {
  certConf.certificatePassword = process.env.WIN_CERT_PASS;
}

// only allow both to be set to more easily debug issues
if (certConf.certificateFile || certConf.certificatePassword) {
  if (!certConf.certificateFile) {
    throw new Error('ForgeConfig: Specified pass but no cert file.');
  }
  if (!certConf.certificatePassword) {
    throw new Error('ForgeConfig: Specified a cert file but no password.');
  }
  console.log('[FORGE] > signing binary.');
}
else {
  console.log('[FORGE] > not signing binary.');
}

// If you have set config.forge to a JavaScript file path in package.json:
// Only showing the relevant configuration for brevity
module.exports = {
  plugins: [
    [
      "@electron-forge/plugin-webpack",
      {
        mainConfig: "./webpack.main.config.js",
        renderer: {
          config: "./webpack.renderer.config.js",
          entryPoints: [
            {
              name: "main_window",
              html: "./src/renderer/index.html",
              js: "./src/renderer/main.js",
              preload: {
                js: "./src/main/preload.js",
              },
            },
          ],
        },
      },
    ],
    [
      "@timfish/forge-externals-plugin",
      {
        externals: ["forcefocus"],
        includeDeps: true,
      },
    ],
  ],
  makers: [
    {
      name: "@electron-forge/maker-zip",
    },
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "avocapture",
        setupIcon: "./branding/logo.ico",
        loadingGif: "./branding/logo_animated.gif",
        ...certConf
      },
    },
    {
      name: "@electron-forge/maker-deb",
    },
    {
      name: "@electron-forge/maker-rpm",
    },
  ],
  packagerConfig: {
    icon: "branding/logo",
  },
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      platforms: ["win32"],
      config: {
        repository: {
          owner: "AnEmortalKid",
          name: "avocapture",
        },
        prerelease: true,
        draft: true,
      },
    },
  ],
};
