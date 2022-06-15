import path from 'path';
import * as fs from "fs"
import app from 'electron';

import { createRequire } from "module";
import LoadedExtension from './loadedExtension';
const require = createRequire(import.meta.url);

function getMethods(obj) {
  let properties = new Set()
  let currentObj = obj
  do {
    Object.getOwnPropertyNames(currentObj).map(item => properties.add(item))
  } while ((currentObj = Object.getPrototypeOf(currentObj)))
  return [...properties.keys()].filter(item => typeof obj[item] === 'function')
}

function checkExtension(extension, name, type) {
  console.log('Checking extension [', name, ']')
  // check bases first
  const checkMethods = ["initialize",
    "teardown",
    "notifyModifying", "notifyModifyApply", "notifyModifyCancel"];

  if (type === "detector") {
    checkMethods.push("register")
  }
  if (type === "uploader") {
    checkMethods.push("upload")
  }

  const objectMethods = getMethods(extension);
  const missing = []
  for (var cm of checkMethods) {
    if (!objectMethods.includes(cm)) {
      missing.push(cm);
    }
  }

  if (missing.length > 0) {
    throw new Error("Extension " + name + " did not declare functions: [" + missing + "]")
  }

}

function checkProperties(avocapture) {
  const requiredProps = ["name", "display", "type"];

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

function loadExtension(extensionPath) {
  // TODO what if it doesn't exist
  // asume the extension has been installed
  const packagePath = path.join(extensionPath, "package.json");
  if (!fs.existsSync(packagePath)) {
    return null;
  }

  let pjson = require(path.join(extensionPath, "package.json"));
  console.log(JSON.stringify(pjson));

  if (!pjson.avocapture) {
    return null;
  }

  checkProperties(pjson.avocapture);

  var ExtensionClass = require(path.join(extensionPath, pjson.main));
  var extensionInstance = new ExtensionClass();
  checkExtension(extensionInstance, pjson.avocapture.name, pjson.avocapture.type);

  return new LoadedExtension(extensionInstance, pjson.avocapture, extensionPath);
}

export default class ExtensionLoader {

  loadExtensions(directory) {
    const files = fs.readdirSync(directory, { withFileTypes: true });

    var extensions = []
    for (var file of files) {
      if (file.isDirectory()) {
        const loadedExtension = loadExtension(path.join(directory, file.name));
        if (loadedExtension) {
          extensions.push(loadedExtension);
        }
      }
    }

    return extensions
  }

}