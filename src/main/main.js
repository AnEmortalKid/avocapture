const { app, BrowserWindow, globalShortcut } = require('electron')
const path = require('path')

import { ReplayDetectionListener } from './detector/replayDetectionListener';
import { HotkeyReplayDetector } from './detector/hotkeyReplayDetector';
const rdl = new ReplayDetectionListener()

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')
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