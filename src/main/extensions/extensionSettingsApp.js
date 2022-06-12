import { ExtensionEvents } from "./extensionEvents";
import { ExtensionSettingsDialog } from "./extensionSettingsDialog";
import path from "path";
import { ipcMain, dialog } from "electron";
import logOn from "../logger/eventLogger";

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
    logOn(ExtensionEvents.EXTENSION_SETTINGS.APPLY, data);
    this.editingContext = null;
    this.extensionManager.applyEdit(data.extensionName, data.settings);
    this.extensionSettingsDialog.destroy();
  }

  handleExtensionCancel(event, data) {
    logOn(ExtensionEvents.EXTENSION_SETTINGS.CANCEL);
    this.extensionManager.cancelEdit(this.editingContext);
    this.editingContext = null;
    this.extensionSettingsDialog.destroy();
  }

  extensionDialogClose() {
    logOn('ExtensionSettingsDialog.CloseFrame');
    // nothing has acted on it, cancel the state
    if (this.editingContext) {
      this.extensionManager.cancelEdit(this.editingContext);
      this.editingContext = null;
    }
  }

  handleExtensionEdit(event, data) {
    logOn(ExtensionEvents.EXTENSION_SETTINGS.INITIALIZE, data);

    const extensionName = data.extensionName;
    const extension = this.extensionManager.getExtension(extensionName);
    const savedExtensionSettings = this.extensionManager.getExtensionSettings(extensionName);
    const extensionDefinedSettings = extension.configuration.settings;

    // TODO consolidate these, formalize
    if (extensionDefinedSettings.view) {
      const dialogViewSettings = {
        viewPath: path.join(extension.extensionPath, extensionDefinedSettings.view.entry),
        dimensions: {
          width: extensionDefinedSettings.view.width,
          height: extensionDefinedSettings.view.height
        }
      }

      this.extensionSettingsDialog = new ExtensionSettingsDialog({
        name: extensionName,
        settings: savedExtensionSettings,
        displaySettings: dialogViewSettings
      }, this.mainWindow, this.extensionDialogClose.bind(this));


      this.editingContext = extensionName;
      this.extensionManager.edit(extensionName);
    }
  }

  async handleSelectDirectory(event, arg) {
    const result = await dialog.showOpenDialog(this.mainWindow, {
      properties: ['openDirectory']
    });

    event.sender.send('select-directory-response', result.filePaths);
    this.extensionSettingsDialog.focus();
  }

  registerEvents() {
    ipcMain.on(ExtensionEvents.EXTENSION_SETTINGS.APPLY, this.handleExtensionApply.bind(this));
    ipcMain.on(ExtensionEvents.EXTENSION_SETTINGS.CANCEL, this.handleExtensionCancel.bind(this));
    ipcMain.on(ExtensionEvents.EXTENSION_SETTINGS.INITIALIZE, this.handleExtensionEdit.bind(this));
    ipcMain.on(ExtensionEvents.ACTIONS.SELECT_DIRECTORY, this.handleSelectDirectory.bind(this));
  }

}