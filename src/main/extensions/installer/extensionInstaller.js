import { app } from "electron";
import { isAvocaptureDebug, isProduction } from "../../util/processInfo";
import { semVerCompare } from "./semverCompare";
import { copyAssets } from "./copyUtils";
import { BaseExtensionInstaller } from "./baseExtensionInstaller";
import { getInstallers } from "./installers";

const fs = require("fs");
const path = require("path");

/**
 * Installs the extension using the given supported installer
 * @param {file} extensionPath
 * @param {BaseExtensionInstaller} installer an installer
 * @return the name of the installed extension
 */
function installWithInstaller(extensionPath, installer) {
  const newPackage = installer.getManifest(extensionPath);
  const destinationRoot = app.getPath("userData");
  const extensionDir = newPackage.name;
  const installDestination = path.join(
    destinationRoot,
    "extensions",
    extensionDir
  );

  if (!newPackage.version) {
    throw new Error(
      `Cannot install extension ${newPackage.name} without declaring a 'version'`
    );
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

  // create installation destination
  fs.mkdirSync(installDestination, { recursive: true });
  // in the future, if we need to change themes, we have to re-install assets
  copyAssets(installDestination);
  installer.installTo(extensionPath, installDestination);
  // TODO needs to use Promise.resolve
  // TODO check async/promise chain YUCK
}

/**
 *
 * @param {*} extensionPath
 * @returns the name of the installed extension if needed
 */
export default function installExtension(extensionPath) {
  for (const installer of getInstallers()) {
    if (installer.supportsInstalling(extensionPath)) {
      const name = installWithInstaller(extensionPath, installer);
      return name;
    }
  }

  throw Error("No installer can handle " + extensionPath);
}
