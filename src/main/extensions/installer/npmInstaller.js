
// TODO better flow for install
const execSync = require('child_process').execSync;

// TODO consider placing plugins in %APPDATA%/avocapture for external
export default class NpmInstaller {

  install(pluginPath) {
    execSync('npm install', { cwd: pluginPath },
      function (error, stdout, stderr) {
        console.log(error);
        console.log(stdout);
        console.log(stderr);
      })
  }
} 5