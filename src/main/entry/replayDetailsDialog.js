import { BrowserWindow } from "electron";
import * as path from "path";
import { ReplayDetailsEvents } from "./replayDetailsEvents";

const forceFocus = require("forcefocus");

export class ReplayDetailsDialog {
  _create(settings) {
    const entryWindow = new BrowserWindow({
      width: 800,
      height: 180,
      frame: false,
      titleBarOverlay: true,
      resizable: false,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
    entryWindow.setBackgroundColor("#d7dbe3");
    entryWindow.setAlwaysOnTop(true, "screen-saver");
    entryWindow.setVisibleOnAllWorkspaces(true);
    entryWindow.setFullScreenable(false);

    entryWindow.loadURL(
      path.resolve(__dirname, "views", "replay", "index.html")
    );

    entryWindow.once("ready-to-show", () => {
      entryWindow.webContents.on(
        "before-input-event",
        this.handleBeforeInputEvent.bind(this)
      );
      entryWindow.webContents.send(
        ReplayDetailsEvents.DIALOG.INITIALIZE,
        settings
      );

      entryWindow.show();
    });

    entryWindow.on("show", () => {
      setTimeout(() => {
        forceFocus.focusWindow(entryWindow);
      }, 200);
    });

    return entryWindow;
  }

  handleBeforeInputEvent(event, input) {
    if (input.key == "Escape") {
      this.hide();
    }
  }

  show(settings) {
    if (!this.entryWindow) {
      this.entryWindow = this._create(settings);
    } else {
      this.entryWindow.webContents.send(
        ReplayDetailsEvents.DIALOG.INITIALIZE,
        settings
      );

      this.entryWindow.show();
    }
  }

  hide() {
    if (this.entryWindow) {
      // https://stackoverflow.com/a/55104179/2262802
      this.entryWindow.minimize();
      this.entryWindow.hide();
    }
  }

  destroy() {
    if (this.entryWindow) {
      this.entryWindow.close();
      this.entryWindow = null;
    }
  }
}
