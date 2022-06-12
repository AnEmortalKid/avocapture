import { ipcMain } from "electron";
import ExtensionLoader from "./loader/extensionLoader";
import { PluginSettingsStore } from "../settings/pluginSettings";

const extensionLoader = new ExtensionLoader();
const extensionSettingsStore = new PluginSettingsStore();

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

  loadExtensions(filePath) {
    log('logExtensions', filePath);
    const loaded = extensionLoader.loadExtensions(filePath);
    for (var extension of loaded) {
      this.extensions[extension.name()] = extension
      // TODO what if we have to migrate
      extensionSettingsStore.setDefaults(extension.name(), extension.configuration.settings.defaults);

      // todo change this
      const pluginObj = {
        pluginName: extension.name(),
        displayName: extension.display()
      }

      if (extension.type() === "detector") {
        this.detectorNames.push(pluginObj)
      }
      if (extension.type() === "uploader") {
        this.uploaderNames.push(pluginObj)
      }
    }
  }

  // TODO temporary
  tempPut(loadedExtension) {
    this.extensions[loadedExtension.name()] = loadedExtension
    extensionSettingsStore.setDefaults(loadedExtension.name(), loadedExtension.configuration.settings.defaults);
    const pluginObj = {
      pluginName: loadedExtension.name(),
      displayName: loadedExtension.display()
    }
    if (loadedExtension.type() === "detector") {
      this.detectorNames.push(pluginObj)
    }
    if (loadedExtension.type() === "uploader") {
      this.uploaderNames.push(pluginObj)
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
    // TODO this should launch the settings dialog
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