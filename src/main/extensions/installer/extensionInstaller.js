import { app } from "electron";
import { isAvocaptureDebug } from "../../util/processInfo";

const execSync = require("child_process").execSync;
const fs = require("fs");
const path = require("path");

function semVerCompare(oldVer, newVer) {
  const oldChunks = oldVer.split(".").map((i) => parseInt(i));
  const newChunks = newVer.split(".").map((i) => parseInt(i));

  // compare equal numbers, return difference if not equal
  for (var i = 0; i < 3; i++) {
    if (oldChunks[i] !== newChunks[i]) {
      return oldChunks[i] - newChunks[i];
    }
  }

  // everything is equal
  return 0;
}

function copyDirectory(source, destination) {
  fs.mkdirSync(destination, { recursive: true });
  fs.readdirSync(source, { withFileTypes: true }).forEach((entry) => {
    let sourcePath = path.join(source, entry.name);
    let destinationPath = path.join(destination, entry.name);

    entry.isDirectory()
      ? copyDirectory(sourcePath, destinationPath)
      : fs.copyFileSync(sourcePath, destinationPath);
  });
}

function copyAssets(installedExtensionPath) {
  const assetPaths = ["css", "font-awesome-4.7.0"];
  for (var assetPath of assetPaths) {
    const assetDir = path.resolve(__dirname, assetPath);
    const destinationPath = path.resolve(
      installedExtensionPath,
      "assets",
      assetPath
    );
    copyDirectory(assetDir, destinationPath);
  }
}

function nmpInstall(pluginPath) {
  execSync(
    "npm install",
    { cwd: pluginPath },
    function (error, stdout, stderr) {
      console.log(error);
      console.log(stdout);
      console.log(stderr);
    }
  );
}

/**
 *
 * @param {*} extensionPath
 * @returns the name of the installed extension if needed
 */
export default function installExtension(extensionPath) {
  const destinationRoot = app.getPath("userData");
  const newPackage = JSON.parse(
    fs.readFileSync(path.join(extensionPath, "package.json"))
  );

  const extensionDir = newPackage.name;
  const installDestination = path.join(
    destinationRoot,
    "extensions",
    extensionDir
  );

  if (!newPackage.version) {
    throw new Error("Cannot install extension without declaring a 'version'");
  }

  // disable comparison in debug mode
  if (!isAvocaptureDebug() && fs.existsSync(installDestination)) {
    const oldPackage = JSON.parse(
      fs.readFileSync(path.join(installDestination, "package.json"))
    );

    const versionComparison = semVerCompare(
      oldPackage.version,
      newPackage.version
    );
    // TODO support downgrades?
    // currently installed is higher or same
    if (versionComparison >= 0) {
      return extensionDir;
    }
  }

  // in the future, if we need to change themes, we have to re-install assets
  copyDirectory(extensionPath, installDestination);
  nmpInstall(installDestination);
  copyAssets(installDestination);

  return extensionDir;
}
