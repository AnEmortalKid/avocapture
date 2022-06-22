import { BrowserWindow } from "electron"
import { isProduction } from "../util/processInfo";

// TODO extend browser window??
export class ExtensionSettingsDialog {

  /**
  * 
  * @param { extensionName, settings} extensionData 
  */
  constructor(extensionData, parent, cancelCallback) {
    const { name, settings, displaySettings } = extensionData;

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
        sandbox: false
      },
    })
    settingsWindow.setBackgroundColor("#d7dbe3");
    settingsWindow.setFullScreenable(false);
    if (isProduction()) {
      settingsWindow.removeMenu();
    }

    settingsWindow.loadURL(displaySettings.viewPath);

    settingsWindow.once("ready-to-show", () => {
      settingsWindow.webContents.send("ExtensionSettings.Initialize." + name, settings);
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