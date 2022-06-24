import { app } from "electron";
import ExtensionLoader from "./loader/extensionLoader";
import { ExtensionSettingsStore } from "../settings/extensionSettings";
import installExtension from "./installer/extensionInstaller";
import Logger from "../logger/logger";
const path = require("path")

const extensionLoader = new ExtensionLoader();
const extensionSettingsStore = new ExtensionSettingsStore();

const logger = new Logger('ExtensionManager');

/**
 * Manages the lifecycle of extensions
 */
export default class ExtensionManager {
  constructor() {
    this.extensions = {}
    this.detectorNames = [];
    this.uploaderNames = [];
  }

  /**
   * Must be called once "app" is ready
   * @param {filePath} extensionPath file path for the location of the extension
   */
  install(extensionPath) {
    logger.logMethod('install', extensionPath);
    installExtension(extensionPath);
  }

  loadInstalled() {
    const destinationRoot = app.getPath("userData");
    const extensionsPath = path.join(destinationRoot, "extensions");
    this.loadExtensions(extensionsPath);
  }

  loadExtensions(filePath) {
    logger.logMethod('loadExtensions', filePath);
    const loaded = extensionLoader.loadExtensions(filePath);
    for (var extension of loaded) {
      this.extensions[extension.name()] = extension

      // TODO pass in migrations object
      extensionSettingsStore.initialize(extension.name());
      extensionSettingsStore.setDefaults(extension.name(), extension.configuration.settings?.defaults);

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

  getExtensionsOfType(type) {
    if (type === "detector") {
      return this.detectorNames
    }
    if (type === "uploader") {
      return this.uploaderNames
    }
  }

  getExtensions() {
    return Object.keys(this.extensions);
  }

  getExtension(extensionName) {
    return this.extensions[extensionName]
  }

  getExtensionSettings(extensionName) {
    return extensionSettingsStore.get(extensionName);
  }

  activate(extensionName) {
    logger.logMethod('activate', extensionName);
    const settings = extensionSettingsStore.get(extensionName);
    const instance = this.extensions[extensionName].instance
    instance.initialize(settings);
  }

  deactivate(extensionName) {
    logger.logMethod('deactivate', extensionName);
    const instance = this.extensions[extensionName].instance
    instance.teardown()
  }

  edit(extensionName) {
    logger.logMethod('edit', extensionName);
    const instance = this.extensions[extensionName].instance
    instance.notifyModifying()
    this.editingContext = extensionName
  }

  applyEdit(extensionName, newSettings) {
    logger.logMethod('applyEdit', extensionName);
    const instance = this.extensions[extensionName].instance
    extensionSettingsStore.save(extensionName, newSettings);
    instance.notifyModifyApply(newSettings);
  }

  cancelEdit(extensionName) {
    logger.logMethod('cancelEdit', extensionName);
    const instance = this.extensions[extensionName].instance
    instance.notifyModifyCancel();
  }

}