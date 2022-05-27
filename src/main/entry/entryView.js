import { BrowserWindow } from "electron"
import *  as path from "path"

export class EntryView {

  create() {
    const entryWindow = new BrowserWindow({
      width: 800,
      height: 600
    })
    entryWindow.setTitle("Entry");

    entryWindow.loadURL(
      path.resolve(__dirname, "views", "entry", "index.html")
    );

    entryWindow.focus();
  }
}