import { BrowserWindow } from "electron"
import *  as path from "path"
import { ReplayDetailsEvents } from "./replayDetailsEvents";

export class ReplayDetailsDialog {

  create() {
    // todo better state handling
    const entryWindow = new BrowserWindow({
      width: 400,
      height: 400,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      ...overlayWindow.WINDOW_OPTS
    })
    entryWindow.setAlwaysOnTop(true, "pop-up-menu");
    entryWindow.setVisibleOnAllWorkspaces(true);
    entryWindow.setFullScreenable(false);
    entryWindow.setTitle("Entry");

    entryWindow.loadURL(
      path.resolve(__dirname, "views", "entry", "index.html")
    );

    entryWindow.once("ready-to-show", () => {
      console.log("Broadcasting Event");
      entryWindow.webContents.send(ReplayDetailsEvents.DIALOG.INITIALIZE, { prefix: "foo" });
      //entryWindow.moveTop();
      entryWindow.show();
      // entryWindow.focus();
    });

    this.entryWindow = entryWindow;
  }
  destroy() {
    this.entryWindow.close();
  }
}