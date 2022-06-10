import { ipcMain } from "electron";
import ExtensionLoader from "./loader/extensionLoader";
import { PluginSettingsStore } from "../settings/pluginSettings";
import { ExtensionEvents } from "./extensionEvents";
import { ExtensionSettingsDialog } from "./extensionSettingsDialog";
import path from "path";

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

    // tracks name of extension being edited
    this.editingContext = null;

    this.registerEvents();
  }

  setMainWindow(mainWindow) {
    this.mainWindow = mainWindow;
  }

  loadExtensions(filePath) {
    log('logExtensions', filePath);
    const loaded = extensionLoader.loadExtensions(filePath);
    for (var extension of loaded) {
      this.extensions[extension.name()] = extension

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

  // TODO should this be in another class, ExtensionSettingsHandler?

  handleExtensionApply(event, data) {
    logOn(ExtensionEvents.PLUGIN_SETTINGS.APPLY, data);
    this.pluginSettingsDialog.destroy();
    this.applyEdit(data.pluginName, data.settings);
    this.editingContext = null;
  }

  handleExtensionCancel(event, data) {
    logOn(ExtensionEvents.PLUGIN_SETTINGS.CANCEL);
    this.cancelEdit(this.editingContext);
    this.pluginSettingsDialog.destroy();
    this.editingContext = null;
  }

  handleExtensionEdit(event, data) {
    logOn(ExtensionEvents.PLUGIN_SETTINGS.INITIALIZE, data);

    const pluginName = data.pluginName;
    const extension = this.getExtension(pluginName);
    const pluginSettings = extensionSettingsStore.get(pluginName);
    const extensionSettings = extension.configuration.settings;

    // TODO consolidate these, formalize
    const dialogViewSettings = {
      viewPath: path.join(extension.extensionPath, extensionSettings.view.entry),
      dimensions: {
        width: extensionSettings.view.width,
        height: extensionSettings.view.height
      }
    }

    this.pluginSettingsDialog = new ExtensionSettingsDialog({
      pluginName: pluginName,
      settings: pluginSettings,
      displaySettings: dialogViewSettings
    }, this.mainWindow, () => this.handleExtensionCancel());


    this.edit(pluginName);
  }

  registerEvents() {
    ipcMain.on(ExtensionEvents.PLUGIN_SETTINGS.APPLY, this.handleExtensionApply.bind(this));
    ipcMain.on(ExtensionEvents.PLUGIN_SETTINGS.CANCEL, this.handleExtensionCancel.bind(this));
    ipcMain.on(ExtensionEvents.PLUGIN_SETTINGS.INITIALIZE, this.handleExtensionEdit.bind(this));
  }

}