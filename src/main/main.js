const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

import { ReplayDetectionListener } from './detector/replayDetectionListener';
import { HotkeyReplayDetector } from './detector/hotkeyReplayDetector';
import { ReplayDetailsDialog } from "./entry/replayDetailsDialog"
import { ConsoleUploader } from './uploader/consoleUploder';
import { ReplayDetailsEvents } from './entry/replayDetailsEvents';


const entryView = new ReplayDetailsDialog();
const rdl = new ReplayDetectionListener(entryView, notifyUploader);
const hrd = new HotkeyReplayDetector();

const uploader = new ConsoleUploader();

function notifyUploader(data) {
  uploader.upload(data);
}

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600
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

  uploader.initialize();

  hrd.register(rdl);
})

ipcMain.on(ReplayDetailsEvents.DIALOG.CANCEL, () => {
  console.log("Cancel");
});

ipcMain.on(ReplayDetailsEvents.DIALOG.APPLY, (event, data) => {
  console.log("Data: ", data)
});