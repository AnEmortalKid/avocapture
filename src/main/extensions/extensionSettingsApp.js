import { ExtensionEvents } from "./extensionEvents";
import { ExtensionSettingsDialog } from "./extensionSettingsDialog";
import path from "path";
import { ipcMain } from "electron";

function logOn(name, data) {
  console.log(`Received [${name}]`, data);
}

/**
 * Responsible for managing the interaction between a user and an extension's settings
 */
export default class ExtensionSettingsApp {
  constructor(extensionManager) {
    this.extensionManager = extensionManager;

    // tracks name of extension being edited
    this.editingContext = null;

    this.registerEvents();
  }

  setMainWindow(mainWindow) {
    this.mainWindow = mainWindow;
  }

  handleExtensionApply(event, data) {
    logOn(ExtensionEvents.PLUGIN_SETTINGS.APPLY, data);
    this.pluginSettingsDialog.destroy();
    this.extensionManager.applyEdit(data.pluginName, data.settings);
    this.editingContext = null;
  }

  handleExtensionCancel(event, data) {
    logOn(ExtensionEvents.PLUGIN_SETTINGS.CANCEL);
    this.extensionManager.cancelEdit(this.editingContext);
    this.pluginSettingsDialog.destroy();
    this.editingContext = null;
  }

  handleExtensionEdit(event, data) {
    logOn(ExtensionEvents.PLUGIN_SETTINGS.INITIALIZE, data);

    const pluginName = data.pluginName;
    const extension = this.extensionManager.getExtension(pluginName);
    const pluginSettings = this.extensionManager.getExtensionSettings(pluginName);
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
    }, this.mainWindow, this.handleExtensionCancel.bind(this));


    this.editingContext = pluginName;
    this.extensionManager.edit(pluginName);
  }

  registerEvents() {
    ipcMain.on(ExtensionEvents.PLUGIN_SETTINGS.APPLY, this.handleExtensionApply.bind(this));
    ipcMain.on(ExtensionEvents.PLUGIN_SETTINGS.CANCEL, this.handleExtensionCancel.bind(this));
    ipcMain.on(ExtensionEvents.PLUGIN_SETTINGS.INITIALIZE, this.handleExtensionEdit.bind(this));
  }

}