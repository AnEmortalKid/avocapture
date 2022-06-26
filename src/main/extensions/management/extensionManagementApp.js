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

  _getExtensionData() {
    const extensionNames = this.extensionManager.getExtensionNames();
    const extensionData = extensionNames.map(name => {
      const extension = this.extensionManager.getExtension(name);

      return {
        name: name,
        display: extension.display(),
        description: extension.description(),
        isBuiltIn: extension.isBuiltIn(),
      }
    });
    return extensionData;
  }

  manage(mainWindow) {

    const production = isProduction();

    const manageWindow = new BrowserWindow({
      width: 450,
      height: 450,
      frame: true,
      modal: production,
      titleBarOverlay: !production,
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
    if (production) {
      manageWindow.removeMenu();
    }

    manageWindow.loadURL(path.resolve(__dirname, "views", "extensions", "management.html"));
    manageWindow.once("ready-to-show", () => {
      manageWindow.webContents.send(ExtensionEvents.EXTENSION_MANAGEMENT.INITIALIZE, this._getExtensionData());
      manageWindow.show();
    });

    this.manageWindow = manageWindow;
  }

  handleExtensionInstall(event, data) {
    logger.logEvent(ExtensionEvents.EXTENSION_MANAGEMENT.INSTALL, data);

    // data is an array of filePaths
    const extensionPath = data[0];
    const extName = this.extensionManager.install(extensionPath);
    this.extensionManager.loadExternal(extName);

    // rebind the new extensions
    this.manageWindow.webContents.send(ExtensionEvents.EXTENSION_MANAGEMENT.INITIALIZE, this._getExtensionData());
  }

  handleExtensionUninstall(event, extensionName) {
    logger.logEvent(ExtensionEvents.EXTENSION_MANAGEMENT.UNINSTALL, extensionName);

    this.extensionManager.uninstall(extensionName);
    // rebind the new extensions
    this.manageWindow.webContents.send(ExtensionEvents.EXTENSION_MANAGEMENT.INITIALIZE, this._getExtensionData());
  }

  handleClose(event, data) {
    this.manageWindow.close();
  }

  registerEvents() {
    ipcMain.on(ExtensionEvents.EXTENSION_MANAGEMENT.INSTALL, this.handleExtensionInstall.bind(this));
    ipcMain.on(ExtensionEvents.EXTENSION_MANAGEMENT.UNINSTALL, this.handleExtensionUninstall.bind(this));
    ipcMain.on(ExtensionEvents.EXTENSION_MANAGEMENT.CLOSE, this.handleClose.bind(this));
  }
}