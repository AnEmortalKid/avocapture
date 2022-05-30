const { app, BrowserWindow, ipcMain } = require('electron')

import { ReplayDetectionListener } from './detector/replayDetectionListener';
import { HotkeyReplayDetector } from './detector/hotkeyReplayDetector';
import { ReplayDetailsDialog } from "./entry/replayDetailsDialog"
import { ConsoleUploader } from './uploader/consoleUploder';
import { ReplayDetailsEvents } from './entry/replayDetailsEvents';


const entryView = new ReplayDetailsDialog();
const rdl = new ReplayDetectionListener(entryView);
const hrd = new HotkeyReplayDetector();

const uploader = new ConsoleUploader();

function notifyUploader(data) {
  uploader.upload(data);
}

let win;

const createWindow = () => {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  // and load the index.html of the app.
  win.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  win.webContents.openDevTools();

}

app.on('window-all-closed', () => {
  console.log('tearing down');
  hrd.teardown();
  if (process.platform !== 'darwin') app.quit()
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // TODO set global prefix in UI and pass it down later
  rdl.setPrefix("Prefix");

  uploader.initialize();

  hrd.register(rdl);
})

ipcMain.on(ReplayDetailsEvents.DIALOG.CANCEL, () => {
  console.log("Cancel");
  entryView.destroy();
});

ipcMain.on(ReplayDetailsEvents.DIALOG.APPLY, (event, data) => {
  console.log("Data: ", data)
  entryView.destroy();
  notifyUploader(data);
  console.log('send event');
  win.webContents.send("ReplayDetails.Add", data);
});