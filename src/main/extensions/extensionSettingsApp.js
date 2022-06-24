import { ExtensionEvents } from "./extensionEvents";
import { ExtensionSettingsDialog } from "./extensionSettingsDialog";
import path from "path";
import { ipcMain } from "electron";
import Logger from "../logger/logger";

const logger = new Logger("ExtensionSettingsApp");

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
    logger.logEvent(ExtensionEvents.EXTENSION_SETTINGS.APPLY, data);
    this.extensionManager.applyEdit(this.editingContext, data.settings);
    this.editingContext = null;
    this.extensionSettingsDialog.destroy();
  }

  handleExtensionCancel(event, data) {
    logger.logEvent(ExtensionEvents.EXTENSION_SETTINGS.CANCEL);
    this.extensionManager.cancelEdit(this.editingContext);
    this.editingContext = null;
    this.extensionSettingsDialog.destroy();
  }

  extensionDialogClose() {
    logger.logMethod('extensionDialogClose');
    // nothing has acted on it, cancel the state
    if (this.editingContext) {
      this.extensionManager.cancelEdit(this.editingContext);
      this.editingContext = null;
    }
  }

  handleExtensionEdit(event, data) {
    logger.logEvent(ExtensionEvents.EXTENSION_SETTINGS.EDIT, data);

    const extensionName = data.extensionName;
    const extension = this.extensionManager.getExtension(extensionName);
    const savedExtensionSettings = this.extensionManager.getExtensionSettings(extensionName);
    const extensionViewSettings = extension.configuration?.settings?.view;

    if (extensionViewSettings) {
      const dialogViewSettings = {
        viewPath: path.join(extension.extensionPath, extensionViewSettings.entry),
        width: extensionViewSettings.width,
        height: extensionViewSettings.height
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

  registerEvents() {
    ipcMain.on(ExtensionEvents.EXTENSION_SETTINGS.APPLY, this.handleExtensionApply.bind(this));
    ipcMain.on(ExtensionEvents.EXTENSION_SETTINGS.CANCEL, this.handleExtensionCancel.bind(this));
    ipcMain.on(ExtensionEvents.EXTENSION_SETTINGS.EDIT, this.handleExtensionEdit.bind(this));
  }

}