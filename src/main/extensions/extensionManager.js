import { ipcMain, app } from "electron";
import ExtensionLoader from "./loader/extensionLoader";
import { ExtensionSettingsStore } from "../settings/extensionSettings";
import { copyDirectory } from "./installer/dirCopy";
import NpmInstaller from "./installer/npmInstaller";
import copyAssets from "./installer/assetCopier";
const path = require("path")

const extensionLoader = new ExtensionLoader();
const extensionSettingsStore = new ExtensionSettingsStore();
const installer = new NpmInstaller();

function log(method, msg) {
  console.log(`[ExtensionManager.${method}]`, msg);
}

function logOn(name, data) {
  console.log(`Received [${name}]`, data);
}

/**
 * Manages the lifecycle of extensions
 */
export default class ExtensionManager {
  constructor() {
    this.extensions = {}
    this.extensionsByType = {}
    this.detectorNames = [];
    this.uploaderNames = [];
  }

  /**
   * must be called once app data is available
   * @param {} filePath 
   */
  install(subDir, extensionPath) {
    const destinationRoot = app.getPath("userData");
    const extensionDir = path.basename(extensionPath);
    const installDestination = path.join(destinationRoot, subDir, extensionDir);
    // copy recursive
    copyDirectory(extensionPath, installDestination);
    installer.install(installDestination);

    // place the assets in there
    copyAssets(installDestination);
  }

  loadInstalled() {
    // check both locations
    const destinationRoot = app.getPath("userData");
    const builtinPath = path.join(destinationRoot, "builtin");
    this.loadExtensions(builtinPath);

    // const additionalPath = path.join(destinationRoot, "extensions");
    //  this.loadExtensions(additionalPath);
  }

  loadExtensions(filePath) {

    log('loadExtensions', filePath);
    const loaded = extensionLoader.loadExtensions(filePath);
    for (var extension of loaded) {
      this.extensions[extension.name()] = extension
      // TODO what if we have to migrate
      extensionSettingsStore.setDefaults(extension.name(), extension.configuration.settings.defaults);

      const extensionData = {
        extensionName: extension.name(),
        displayName: extension.display()
      }

      if (extension.type() === "detector") {
        this.detectorNames.push(extensionData)
      }
      if (extension.type() === "uploader") {
        this.uploaderNames.push(extensionData)
      }
    }
  }

  // TODO temporary
  tempPut(loadedExtension) {
    this.extensions[loadedExtension.name()] = loadedExtension
    extensionSettingsStore.setDefaults(loadedExtension.name(), loadedExtension.configuration.settings.defaults);
    const extensionData = {
      extensionName: loadedExtension.name(),
      displayName: loadedExtension.display()
    }
    if (loadedExtension.type() === "detector") {
      this.detectorNames.push(extensionData)
    }
    if (loadedExtension.type() === "uploader") {
      this.uploaderNames.push(extensionData)
    }
  }

  getExtensions(type) {
    if (type === "detector") {
      return this.detectorNames
    }
    if (type === "uploader") {
      return this.uploaderNames
    }
  }

  getExtension(extensionName) {
    return this.extensions[extensionName]
  }

  getExtensionSettings(extensionName) {
    return extensionSettingsStore.get(extensionName);
  }

  activate(extensionName) {
    log('activate', extensionName);
    const settings = extensionSettingsStore.get(extensionName);
    const instance = this.extensions[extensionName].instance
    instance.initialize(settings);
  }

  deactivate(extensionName) {
    log('deactivate', extensionName);
    const instance = this.extensions[extensionName].instance
    instance.teardown()
  }

  edit(extensionName) {
    log('edit', extensionName);
    const instance = this.extensions[extensionName].instance
    instance.notifyModifying()
    this.editingContext = extensionName
  }

  applyEdit(extensionName, newSettings) {
    log('applyEdit', extensionName);
    const instance = this.extensions[extensionName].instance
    extensionSettingsStore.save(extensionName, newSettings);
    instance.notifyModifyApply(newSettings);
  }

  cancelEdit(extensionName) {
    log('cancelEdit', extensionName);
    const instance = this.extensions[extensionName].instance
    instance.notifyModifyCancel();
  }

}