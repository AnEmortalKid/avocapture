const { app, BrowserWindow, ipcMain } = require('electron')

import { ReplayDetectionListener } from './detector/replayDetectionListener';
import { HotkeyReplayDetector } from './detector/hotkeyReplayDetector';
import { ReplayDetailsDialog } from "./entry/replayDetailsDialog"
import { ConsoleUploader } from './uploader/consoleUploder';
import { ReplayDetailsEvents } from './entry/replayDetailsEvents';
import { ReplaySaver } from './saver/replaySaver';
import { HotkeySettingsDialog } from './detector/settings/hotkeySettingsDialog';


const replayDialog = new ReplayDetailsDialog();
const replaySaver = new ReplaySaver();
const rdl = new ReplayDetectionListener(replayDialog, replaySaver);

const hotkeyReplayDetector = new HotkeyReplayDetector();
const hotkeySettingsDialog = new HotkeySettingsDialog();
const uploader = new ConsoleUploader();

function notifyUploader(data) {
  uploader.upload(data);
}

function logOn(name) {
  console.log(`Received [${name}]`);
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
  hotkeyReplayDetector.teardown();
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

  // TODO grab from store
  hotkeyReplayDetector.initialize({
    vKey: 111,
    browserName: "NumpadDivide"
  });
  hotkeyReplayDetector.register(rdl);
})

ipcMain.on(ReplayDetailsEvents.DIALOG.CANCEL, () => {
  console.log("Cancel");
  replayDialog.destroy();
});

ipcMain.on(ReplayDetailsEvents.DIALOG.APPLY, (event, data) => {
  console.log("Applying: ", data)
  replayDialog.destroy();
  notifyUploader(data);
  console.log('send event');
  replaySaver.setTitle(data);
  win.webContents.send("ReplayDetails.Add", replaySaver.getReplayData(data.replayUuid));
});

ipcMain.on('HotkeySettings.Initialize', (event, data) => {
  logOn('HotkeySettings.Initialize');
  // todo grab from store
  hotkeySettingsDialog.create({
    vKey: 111,
    browserName: "NumpadDivide"
  });
});

ipcMain.on('HotkeySettings.Modifying', (event, data) => {
  logOn('HotkeySettings.Modifying');
  hotkeyReplayDetector.pause();
});

ipcMain.on('HotkeySettings.Dialog.Apply', (event, data) => {
  logOn('HotkeySettings.Dialog.Apply');
  // TODO save to store
  hotkeyReplayDetector.initialize(data);
});

ipcMain.on('HotkeySettings.Dialog.Cancel', (event, data) => {
  logOn('HotkeySettings.Dialog.Cancel');
  hotkeyReplayDetector.unpause();
});