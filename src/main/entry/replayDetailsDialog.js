import { BrowserWindow } from "electron"
import *  as path from "path"
import { ReplayDetailsEvents } from "./replayDetailsEvents";

export class ReplayDetailsDialog {

  create(contextData) {
    // todo better state handling
    const entryWindow = new BrowserWindow({
      width: 400,
      height: 400,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    })
    entryWindow.setAlwaysOnTop(true, "screen-saver");
    entryWindow.setVisibleOnAllWorkspaces(true);
    entryWindow.setFullScreenable(false);
    entryWindow.setTitle("Entry");

    entryWindow.loadURL(
      path.resolve(__dirname, "views", "entry", "index.html")
    );

    entryWindow.once("ready-to-show", () => {
      console.log("Broadcasting Event");
      entryWindow.webContents.send(ReplayDetailsEvents.DIALOG.INITIALIZE, { id: contextData.id, prefix: "foo" });
      entryWindow.moveTop();
      entryWindow.show();
      entryWindow.focus();
    });

    this.entryWindow = entryWindow;
  }
  destroy() {
    this.entryWindow.close();
  }
}