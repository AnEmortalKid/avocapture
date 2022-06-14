import { app } from "electron";
import ExtensionLoader from "./loader/extensionLoader";
import { ExtensionSettingsStore } from "../settings/extensionSettings";
import installExtension from "./installer/extensionInstaller";
const path = require("path")

const extensionLoader = new ExtensionLoader();
const extensionSettingsStore = new ExtensionSettingsStore();

function log(method, msg) {
  console.log(`[ExtensionManager.${method}]`, msg);
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
   * Must be called once "app" is ready
   * @param {filePath} extensionPath file path for the location of the extension
   */
  install(extensionPath) {
    log('install', extensionPath);
    installExtension(extensionPath);
  }

  loadInstalled() {
    const destinationRoot = app.getPath("userData");
    const extensionsPath = path.join(destinationRoot, "extensions");
    this.loadExtensions(extensionsPath);
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