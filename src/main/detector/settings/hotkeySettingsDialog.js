import { BrowserWindow } from "electron"
import *  as path from "path"

export class HotkeySettingsDialog {

  create(contextData) {
    // todo better state handling
    const entryWindow = new BrowserWindow({
      width: 200,
      height: 200,
      frame: true,
      titleBarOverlay: true,
      resizable: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    })
    entryWindow.setBackgroundColor("#d7dbe3");
    entryWindow.setFullScreenable(false);
    entryWindow.setTitle("Hotkey Settings");

    entryWindow.loadURL(
      path.resolve(__dirname, "views", "hotkey", "index.html")
    );

    entryWindow.once("ready-to-show", () => {
      console.log("Broadcasting Event");
      entryWindow.webContents.send("HotkeySettings.Dialog.Initialize", contextData);
      entryWindow.show();
    });

    this.entryWindow = entryWindow;
  }

  destroy() {
    this.entryWindow.close();
  }
}