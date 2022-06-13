import { app } from "electron";
import { copyDirectory } from "./dirCopy";
import NpmInstaller from "./npmInstaller";
import copyAssets from "./assetCopier";
const path = require("path");

const fs = require("fs");
const npmInstaller = new NpmInstaller();

function semVerCompare(oldVer, newVer) {
  const oldChunks = oldVer.split('.').map(i => parseInt(i));
  const newChunks = newVer.split('.').map(i => parseInt(i));

  // compare equal numbers, return difference if not equal
  for (var i = 0; i < 3; i++) {
    if (oldChunks[i] !== newChunks[i]) {
      return oldChunks[i] - newChunks[i];
    }
  }

  // everything is equal
  return 0;
}


export default function installExtension(extensionPath) {

  const destinationRoot = app.getPath("userData");
  const extensionDir = path.basename(extensionPath);
  const installDestination = path.join(destinationRoot, "extensions", extensionDir);

  if (fs.existsSync(installDestination)) {
    const oldPackage = JSON.parse(fs.readFileSync(path.join(installDestination, 'package.json')))
    const newPackage = JSON.parse(fs.readFileSync(path.join(extensionPath, 'package.json')))

    const versionComparison = semVerCompare(oldPackage.version, newPackage.version);
    // TODO support downgrades?
    // currently installed is higher or same
    if (versionComparison >= 0) {
      return;
    }
  }

  copyDirectory(extensionPath, installDestination);
  npmInstaller.install(installDestination);
  copyAssets(installDestination);
}