import { BrowserWindow } from "electron"
import *  as path from "path"

export class ExtensionSettingsDialog {

  /**
  * 
  * @param { pluginName, settings} extensionData 
  */
  constructor(extensionData, parent) {
    const { pluginName, settings, displaySettings } = extensionData;

    const settingsWindow = new BrowserWindow({
      width: displaySettings.dimensions.width ?? 400,
      height: displaySettings.dimensions.height ?? 400,
      frame: false,
      modal: true,
      titleBarOverlay: false,
      resizable: true,
      parent: parent,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    })
    settingsWindow.setBackgroundColor("#d7dbe3");
    settingsWindow.setFullScreenable(false);
    settingsWindow.removeMenu();

    settingsWindow.loadURL(displaySettings.view);

    settingsWindow.once("ready-to-show", () => {
      console.log("Broadcasting Event");
      settingsWindow.webContents.send("PluginSettings.Initialize." + pluginName, settings);
      settingsWindow.show();
    });

    this.entryWindow = settingsWindow;
  }

  destroy() {
    this.entryWindow.close();
  }

  focus() {
    this.entryWindow.focus();
  }

}