import { BrowserWindow } from "electron"
import *  as path from "path"
import { EntryEvents } from "./entryEvents";

export class EntryView {

  create() {
    const entryWindow = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    })
    entryWindow.setTitle("Entry");

    entryWindow.loadURL(
      path.resolve(__dirname, "views", "entry", "index.html")
    );

    entryWindow.once("ready-to-show", () => {
      console.log("Broadcasting Event");
      entryWindow.webContents.send(EntryEvents.DIALOG.INITIALIZE, { prefix: "foo" });
      entryWindow.show();
      entryWindow.focus();
    });
  }
}