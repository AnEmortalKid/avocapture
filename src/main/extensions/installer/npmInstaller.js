
const execSync = require('child_process').execSync;

/**
 * Component responsible for npm installing an extension's dependencies
 */
export default class NpmInstaller {

  install(pluginPath) {
    execSync('npm install', { cwd: pluginPath },
      function (error, stdout, stderr) {
        console.log(error);
        console.log(stdout);
        console.log(stderr);
      })
  }
}
