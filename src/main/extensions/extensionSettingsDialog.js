import { BrowserWindow } from "electron"
import *  as path from "path"

export class ExtensionSettingsDialog {

  /**
  * 
  * @param { pluginName, settings} extensionData 
  */
  constructor(extensionData) {
    const { pluginName, settings } = extensionData;

    // TODO get prefered window size
    const settingsWindow = new BrowserWindow({
      width: 300,
      height: 300,
      frame: true,
      modal: false,
      titleBarOverlay: false,
      resizable: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    })
    settingsWindow.setBackgroundColor("#d7dbe3");
    settingsWindow.setFullScreenable(false);
    settingsWindow.setTitle("Hotkey Settings");

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

}