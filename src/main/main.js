const { app, BrowserWindow, globalShortcut } = require('electron')
const path = require('path')

import { ReplayDetectionListener } from './detector/replayDetectionListener';
import { HotkeyReplayDetector } from './detector/hotkeyReplayDetector';


const rdl = new ReplayDetectionListener();

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600
  })

  // and load the index.html of the app.
  win.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  win.webContents.openDevTools();

  // TODO figure out how to open this
  // const childWindow = new BrowserWindow({
  //   width: 800,
  //   height: 600
  // })
  // childWindow.document.write(```
  // < !DOCTYPE html >
  // <html>

  //   <h1> Data entry here dog</h1>

  // </html>
  // ```)
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  const hrd = new HotkeyReplayDetector();
  hrd.register(rdl);

  // Check whether a shortcut is registered.
  console.log(globalShortcut.isRegistered('numadd'))
})