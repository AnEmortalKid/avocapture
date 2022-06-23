import { BrowserWindow, ipcMain } from "electron";
import * as path from 'path';
import Logger from "../../logger/logger";
import { isProduction } from "../../util/processInfo";
import { ExtensionEvents } from "../extensionEvents";

const logger = new Logger('ExtensionManagementApp');

/**
 * Responsible for managing the available extensions, installing/uninstalling
 */
export default class ExtensionManagementApp {
  constructor(extensionManager) {
    this.extensionManager = extensionManager;

    this.registerEvents();
  }

  manage(mainWindow) {
    const manageWindow = new BrowserWindow({
      width: 400,
      height: 400,
      frame: !isProduction(),
      modal: isProduction(),
      titleBarOverlay: !isProduction(),
      resizable: true,
      parent: mainWindow,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        sandbox: false
      },
    })
    manageWindow.setBackgroundColor("#d7dbe3");
    manageWindow.setFullScreenable(false);
    if (isProduction()) {
      manageWindow.removeMenu();
    }

    manageWindow.loadURL(path.resolve(__dirname, "views", "extensions", "management.html"));

    if (!isProduction()) {
      manageWindow.webContents.openDevTools();
    }

    const extensions = this.extensionManager.getExtensions();
    manageWindow.once("ready-to-show", () => {
      manageWindow.webContents.send("ExtensionManagement.Initialize", extensions);
      manageWindow.show();
    });
  }

  handleExtensionInstall(event, data) {
    logger.logEvent(ExtensionEvents.EXTENSION_MANAGEMENT.INSTALL, data);
  }

  handleExtensionUninstall(event, data) {
    logger.logEvent(ExtensionEvents.EXTENSION_MANAGEMENT.UNINSTALL, data);
  }

  registerEvents() {
    ipcMain.on(ExtensionEvents.EXTENSION_MANAGEMENT.INSTALL, this.handleExtensionInstall.bind(this));
    ipcMain.on(ExtensionEvents.EXTENSION_MANAGEMENT.UNINSTALL, this.handleExtensionUninstall.bind(this));
  }
}