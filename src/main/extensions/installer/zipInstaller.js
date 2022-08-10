import Logger from "../../logger/logger";
import { BaseExtensionInstaller } from "./baseExtensionInstaller";

const fs = require("fs");

const logger = new Logger("ZipInstaller");
const path = require("path");
const StreamZip = require("node-stream-zip");

export class ZipInstaller extends BaseExtensionInstaller {
  /**
   * Determines whether this installer is able to install an extension located at the given path.
   */
  supportsInstalling(extensionPath) {
    logger.logMethod("supportsInstalling", `Checking ${extensionPath}`);

    const isDir = fs.lstatSync(extensionPath).isDirectory();
    const extension = path.extname(extensionPath);

    logger.log(
      `Evaluating based on isDirectory: ${isDir} extension: ${extension}`
    );

    return !isDir && extension === "zip";
  }

  /**
   * Installs the extension located at the given path to the desired destination
   * @param {file} extensionPath
   * @param {directory} installationDestination
   */
  installTo(extensionPath, installationDestination) {
    logger.logMethod(
      "installTo",
      `Copying and npm installing ${extensionPath} to ${installationDestination}`
    );

    const zip = new StreamZip({ file: extensionPath });
    zip.on("extract", (entry, file) => {
      console.log(`Extracted ${entry.name} to ${file}`);
    });
    zip.on("ready", () => {
      zip.extract(null, installationDestination, (err, count) => {
        zip.close();
      });
    });
  }

  /**
   * Returns an object with the contents of the package.json.
   *
   * Each installer is responsible for determining the mechanism needed to read this information.
   *
   * @param {file} extensionPath a file path to where the extension is defined
   */
  getManifest(extensionPath) {
    const zip = new StreamZip({ file: extensionPath });
    zip.on("ready", () => {
      const data = zip.entryDataSync("package.json");
      zip.close();
      return JSON.parse(data);
    });
  }
}
