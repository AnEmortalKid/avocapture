import Logger from "../../logger/logger";
import { BaseExtensionInstaller } from "./baseExtensionInstaller";
import { copyDirectory } from "./copyUtils";

const fs = require("fs");
const path = require("path");

const execSync = require("child_process").execSync;
const commandExistsSync = require("command-exists").sync;

const logger = new Logger("NpmInstaller");

function nmpInstall(pluginPath) {
  execSync(
    "npm install --omit=dev",
    { cwd: pluginPath },
    function (error, stdout, stderr) {
      logger.error(error);
      logger.log("> " + stdout);
      logger.error(stderr);
    }
  );
}

export class NpmInstaller extends BaseExtensionInstaller {
  getManifest(extensionPath) {
    return JSON.parse(
      fs.readFileSync(path.join(extensionPath, "package.json"))
    );
  }

  supportsInstalling(extensionPath) {
    logger.logMethod("supportsInstalling", `Checking ${extensionPath}`);

    const isDir = fs.lstatSync(extensionPath).isDirectory();
    const npmExists = commandExistsSync("npm");
    logger.log(
      `Evaluating based on isDirectory: ${isDir} npmExists: ${npmExists}`
    );

    return isDir && npmExists;
  }

  installTo(extensionPath, installationDestination) {
    logger.logMethod(
      "installTo",
      `Copying and npm installing ${extensionPath} to ${installationDestination}`
    );
    copyDirectory(extensionPath, installationDestination);
    nmpInstall(installationDestination);
  }
}
