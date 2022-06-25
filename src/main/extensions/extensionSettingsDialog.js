import { BrowserWindow } from "electron"
import { isProduction } from "../util/processInfo";
import { ExtensionEvents } from "./extensionEvents";

const path = require('path');

// TODO extend browser window??
export class ExtensionSettingsDialog {

  /**
  * 
  * @param { extensionName, settings} extensionData 
  */
  constructor(extensionData, parent, cancelCallback) {
    const { name, settings, displaySettings } = extensionData;

    const preloadPath = path.resolve(__dirname, "extensions", "commonPreload.js")

    // TODO change mode with modal and frame
    const settingsWindow = new BrowserWindow({
      width: displaySettings.width ?? 400,
      height: displaySettings.height ?? 400,
      frame: true,
      modal: false,
      titleBarOverlay: true,
      resizable: true,
      parent: parent,
      // TODO figure this out with sandboxing
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        sandbox: false,
        preload: preloadPath
      },
    })
    // TODO can we load a preload with an 'api'?

    settingsWindow.setBackgroundColor("#d7dbe3");
    settingsWindow.setFullScreenable(false);
    if (isProduction()) {
      settingsWindow.removeMenu();
    }

    settingsWindow.loadURL(displaySettings.viewPath);

    settingsWindow.once("ready-to-show", () => {
      settingsWindow.webContents.send(ExtensionEvents.EXTENSION_SETTINGS.INITIALIZE_PREFIX + name, settings);
      settingsWindow.show();
    });

    settingsWindow.on('close', () => cancelCallback());

    this.entryWindow = settingsWindow;
  }

  destroy() {
    this.entryWindow.close();
  }

  focus() {
    this.entryWindow.focus();
  }

}