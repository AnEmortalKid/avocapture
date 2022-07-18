import { BrowserWindow } from "electron";
import { isProduction } from "../../util/processInfo";
import { dialogBackgroundColor } from "../../util/styling";
import { ExtensionEvents } from "../extensionEvents";

const path = require("path");

// TODO extend browser window??
export class ExtensionSettingsDialog {
  /**
   *
   * @param { extensionName, settings} extensionData
   */
  constructor(extensionData, parent, cancelCallback) {
    const { name, settings, displaySettings } = extensionData;

    /**
     * webpack moves the file relative to where the main app runs
     * 
     * so this directory won't be src/main/extensions/settings/commonPreload
     */
    const preloadPath = path.resolve(
      __dirname,
      "extensions",
      "commonPreload.js"
    );

    const production = isProduction();

    const settingsWindow = new BrowserWindow({
      width: displaySettings.width ?? 400,
      height: displaySettings.height ?? 400,
      frame: true,
      modal: production,
      titleBarOverlay: !production,
      resizable: true,
      parent: parent,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        preload: preloadPath,
      },
    });

    settingsWindow.setBackgroundColor(dialogBackgroundColor);
    settingsWindow.setFullScreenable(false);
    if (production) {
      settingsWindow.removeMenu();
    }

    settingsWindow.loadURL(displaySettings.viewPath);

    settingsWindow.once("ready-to-show", () => {
      settingsWindow.webContents.send(
        ExtensionEvents.EXTENSION_SETTINGS.INITIALIZE,
        settings
      );
      settingsWindow.show();
    });

    settingsWindow.on("close", () => cancelCallback());

    this.entryWindow = settingsWindow;
  }

  destroy() {
    this.entryWindow.close();
  }

  focus() {
    this.entryWindow.focus();
  }
}
