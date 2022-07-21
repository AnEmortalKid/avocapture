import path from "path";
import * as fs from "fs";

import { createRequire } from "module";
import LoadedExtension from "./loadedExtension";
import Logger from "../../logger/logger";
import ExtensionLogger from "../../logger/extensionLogger";
import { requireProvider } from "../../util/requireProvider";
const require = requireProvider();

const logger = new Logger("ExtensionLoader");

function getMethods(obj) {
  let properties = new Set();
  let currentObj = obj;
  do {
    Object.getOwnPropertyNames(currentObj).map((item) => properties.add(item));
  } while ((currentObj = Object.getPrototypeOf(currentObj)));
  return [...properties.keys()].filter(
    (item) => typeof obj[item] === "function"
  );
}

function checkExtension(extension, name, type) {
  logger.logMethod("checkExtension", "[" + name + "," + type + "]");
  // check bases first
  const checkMethods = [
    "initialize",
    "teardown",
    "notifyModifying",
    "notifyModifyApply",
    "notifyModifyCancel",
  ];

  if (type === "detector") {
    checkMethods.push("register");
  }
  if (type === "uploader") {
    checkMethods.push("upload");
  }

  const objectMethods = getMethods(extension);
  const missing = [];
  for (var cm of checkMethods) {
    if (!objectMethods.includes(cm)) {
      missing.push(cm);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      "Extension " + name + " did not declare functions: [" + missing + "]"
    );
  }
}

function checkAvocaptureProperties(avocapture) {
  const requiredProps = ["display", "type", "settings"];

  const missingProps = [];
  for (const requiredProp of requiredProps) {
    if (!avocapture[requiredProp]) {
      missingProps.push(requiredProp);
    }
  }

  if (missingProps.length > 0) {
    throw new Error("Avocapture object is missing [" + missingProps + "]");
  }
}

function checkPackageJsonProperties(packageJson) {
  const requiredProps = ["name", "main", "version"];

  const missingProps = [];
  for (const requiredProp of requiredProps) {
    if (!packageJson[requiredProp]) {
      missingProps.push(requiredProp);
    }
  }

  if (missingProps.length > 0) {
    throw new Error("package.json object is missing [" + missingProps + "]");
  }
}

function checkLoadable(packageJson) {
  checkPackageJsonProperties(packageJson);

  if (!packageJson.avocapture) {
    throw new Error("avocapture object not defined in package.json");
  }

  checkAvocaptureProperties(packageJson.avocapture);
}

export default class ExtensionLoader {
  loadExtension(extensionPath) {
    // asume the extension has been installed
    const packagePath = path.join(extensionPath, "package.json");
    if (!fs.existsSync(packagePath)) {
      return null;
    }

    let pjson = require(path.join(extensionPath, "package.json"));
    logger.log(`Checking package.json ${JSON.stringify(pjson)}`);
    checkLoadable(pjson);

    const configuration = {
      name: pjson.name,
      description: pjson.description,
      ...pjson.avocapture,
    };

    var ExtensionClass = require(path.join(extensionPath, pjson.main));
    var extensionInstance = new ExtensionClass({
      logger: new ExtensionLogger(configuration.name),
    });
    checkExtension(extensionInstance, configuration.name, configuration.type);
    // TODO mark builtin here
    return new LoadedExtension(extensionInstance, configuration, extensionPath);
  }

  loadExtensions(directory) {
    const files = fs.readdirSync(directory, { withFileTypes: true });

    var extensions = [];
    for (var file of files) {
      if (file.isDirectory()) {
        const loadedExtension = this.loadExtension(
          path.join(directory, file.name)
        );
        if (loadedExtension) {
          extensions.push(loadedExtension);
        }
      }
    }

    return extensions;
  }
}
