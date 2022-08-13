import Logger from "../../logger/logger";
import { BaseExtensionInstaller } from "./baseExtensionInstaller";

const fs = require("fs");

const logger = new Logger("ZipInstaller");
const path = require("path");
const AdmZip = require("adm-zip");

export class ZipInstaller extends BaseExtensionInstaller {
  /**
   * Determines whether this installer is able to install an extension located at the given path.
   */
  supportsInstalling(extensionPath) {
    // TODO this is not working
    logger.logMethod("supportsInstalling", `Checking ${extensionPath}`);

    const isDir = fs.lstatSync(extensionPath).isDirectory();
    const extension = path.extname(extensionPath);

    logger.log(
      `Evaluating based on isDirectory: ${isDir} extension: ${extension}`
    );

    return !isDir && extension === ".zip";
  }

  /**
   * Installs the extension located at the given path to the desired destination
   * @param {file} extensionPath
   * @param {directory} installationDestination
   */
  installTo(extensionPath, installationDestination) {
    logger.logMethod(
      "installTo",
      `Copying and unzipping ${extensionPath} to ${installationDestination}`
    );

    const azip = new AdmZip(extensionPath);
    azip.extractAllTo(installationDestination, true);
  }

  /**
   * Returns an object with the contents of the package.json.
   *
   * Each installer is responsible for determining the mechanism needed to read this information.
   *
   * @param {file} extensionPath a file path to where the extension is defined
   */
  getManifest(extensionPath) {
    const azip = new AdmZip(extensionPath);
    return JSON.parse(azip.readAsText("package.json"));
  }
}
