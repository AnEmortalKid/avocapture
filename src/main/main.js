const { app, BrowserWindow } = require('electron')
const path = require('path')

import { ReplayDetectionListener } from './detector/replayDetectionListener';
import { HotkeyReplayDetector } from './detector/hotkeyReplayDetector';
import { EntryView } from "./entry/entryView"


const entryView = new EntryView();
const rdl = new ReplayDetectionListener(entryView);
const hrd = new HotkeyReplayDetector();

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

  hrd.register(rdl);
})