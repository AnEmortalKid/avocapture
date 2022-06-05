import { BrowserWindow } from "electron"
import *  as path from "path"

export class ExtensionSettingsDialog {

  /**
  * 
  * @param { pluginName, settings} extensionData 
  */
  constructor(extensionData, parent) {
    const { pluginName, settings } = extensionData;

    // TODO get prefered window size
    const settingsWindow = new BrowserWindow({
      width: 500,
      height: 500,
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

    // TODO get a relative dir to "plugin install"
    settingsWindow.loadURL(
      path.resolve(__dirname, "views", "hotkey", "index.html")
    );

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