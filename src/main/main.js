const { app, BrowserWindow, ipcMain } = require('electron')

import { ReplayDetectionListener } from './detector/replayDetectionListener';
import { HotkeyReplayDetector } from './detector/hotkeyReplayDetector';
import { ReplayDetailsDialog } from "./entry/replayDetailsDialog"
import { ConsoleUploader } from './uploader/consoleUploder';
import { ReplayDetailsEvents } from './entry/replayDetailsEvents';
import { ReplaySaver } from './saver/replaySaver';
import { HotkeySettingsDialog } from './detector/settings/hotkeySettingsDialog';
import { AppSettings } from './settings/appSettings';
import { readlink } from 'fs';


const appSettings = new AppSettings();

const replayDialog = new ReplayDetailsDialog();
const replaySaver = new ReplaySaver();
const replayDetectionListener = new ReplayDetectionListener(replayDialog, replaySaver);

const hotkeyReplayDetector = new HotkeyReplayDetector();
const hotkeySettingsDialog = new HotkeySettingsDialog();
const uploader = new ConsoleUploader();

const plugins = {};

// TODO load plugins

function getPlugin(pluginName) {
  return plugins[pluginName];
}

function notifyUploader(data) {
  uploader.upload(data);
}

function logOn(name, data) {
  console.log(`Received [${name}]`, data);
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

  win.webContents.on('did-finish-load', () => {
    win.webContents.send('AppSettings.Initialize', appSettings.getApp());
  });

  replayDetectionListener.setPrefix(appSettings.getApp().prefix);
  uploader.initialize();
  hotkeyReplayDetector.initialize(
    appSettings.get('hotkeyDetector', {
      vKey: 111,
      browserName: "NumpadDivide"
    }));
  hotkeyReplayDetector.register(replayDetectionListener);
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
  logOn('HotkeySettings.Initialize', data);
  // TODO consistent plugin name
  hotkeySettingsDialog.create(appSettings.get('hotkeyDetector', {
    vKey: 111,
    browserName: "NumpadDivide"
  }));
});

ipcMain.on('HotkeySettings.Modifying', (event, data) => {
  logOn('HotkeySettings.Modifying');
  hotkeyReplayDetector.notifyModifying();
});

ipcMain.on('HotkeySettings.Dialog.Apply', (event, data) => {
  logOn('HotkeySettings.Dialog.Apply', data);
  appSettings.save('hotkeyDetector', data);
  hotkeyReplayDetector.notifyModifyApply(data);
  hotkeySettingsDialog.destroy();
});

ipcMain.on('HotkeySettings.Dialog.Cancel', (event, data) => {
  logOn('HotkeySettings.Dialog.Cancel');
  hotkeyReplayDetector.notifyModifyCancel();
  hotkeySettingsDialog.destroy();
});

ipcMain.on('AppSettings.Apply', (event, data) => {
  logOn('AppSettings.Apply');
  console.log(data);
  appSettings.saveApp(data);
  replayDetectionListener.setPrefix(data.prefix);
});

ipcMain.on('PluginSettings.Apply', (event, data) => {
  logOn('PluginSettings.Apply', data);
  // find plugin by name
  // notifyModifyApply(data)
});

ipcMain.on('PluginSettings.Cancel', (event, data) => {
  logOn('PluginSettings.Cancel');
  // find plugin by name
  // notifyModifyCancel()
});

ipcMain.on('PluginSettings.Modify', (event, data) => {
  logOn('PluginSettings.Modify', data);

  // find plugin extension by name
  // notifyModifying()
});

ipcMain.on('PluginSettings.Initialize', (event, data) => {
  logOn('PluginSettings.Initialize', data);

  // find plugin extension by name
  console.log(data);
  // TODO consistent plugin name
  // hotkeySettingsDialog.create(appSettings.get('hotkeyDetector', {
  //   vKey: 111,
  //   browserName: "NumpadDivide"
  // }));
});