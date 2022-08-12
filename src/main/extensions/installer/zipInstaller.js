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
  async installTo(extensionPath, installationDestination) {
    logger.logMethod(
      "installTo",
      `Copying and npm installing ${extensionPath} to ${installationDestination}`
    );

    const zip = new StreamZip.async({ file: extensionPath });
    zip.on("extract", (entry, file) => {
      logger.log(">" + file);
    });

    const count = await zip.extract(null, installationDestination);
    logger.log(`Extracted ${count} entries`);
    await zip.close();
    return new Promise(resolve => {
      resolve(count)
    });

    // zip.on("ready", () => {
    //   zip.extract(null, installationDestination, (err, count) => {
    //     logger.error(err);
    //     zip.close();
    //   });
    // });
  }

  /**
   * Returns an object with the contents of the package.json.
   *
   * Each installer is responsible for determining the mechanism needed to read this information.
   *
   * @param {file} extensionPath a file path to where the extension is defined
   */
  async getManifest(extensionPath) {
    // TODO this isn't sync
    const zip = new StreamZip.async({ file: extensionPath });

    const data = await zip.entryData("package.json");
    await zip.close();
    return new Promise(resolve => {
      resolve(JSON.parse(String.fromCharCode.apply(null, data)))
    });

    // zip.on("ready", () => {
    //   const data = zip.entryDataSync("package.json");
    //   zip.close();
    //   cb();
    // });
  }
}
