const { app, BrowserWindow, ipcMain, dialog } = require('electron')

import { ReplayDetectionListener } from './detector/replayDetectionListener';
import { HotkeyReplayDetector } from './detector/hotkeyReplayDetector';
import { ReplayDetailsDialog } from "./entry/replayDetailsDialog"
import { ConsoleUploader } from './uploader/consoleUploderExtension';
import { ReplayDetailsEvents } from './entry/replayDetailsEvents';
import { ReplaySaver } from './saver/replaySaver';
import { AppSettings } from './settings/appSettings';
import { PluginSettingsStore } from './settings/pluginSettings';
import ExtensionLoader from './extensions/loader/extensionLoader';
import LoadedExtension from './extensions/loader/loadedExtension';
import ExtensionManager from './extensions/extensionManager';

const path = require('path')
const fs = require('fs');

const os = require("os");
const userHomeDir = os.homedir();


const appSettingsStore = new AppSettings();
const pluginSettingsStore = new PluginSettingsStore();

const replayDialog = new ReplayDetailsDialog();
const replaySaver = new ReplaySaver();
const replayDetectionListener = new ReplayDetectionListener(replayDialog, replaySaver);

const hotkeyReplayDetector = new HotkeyReplayDetector();

const uploader = new ConsoleUploader();

const extensionLoader = new ExtensionLoader();
const extensionManager = new ExtensionManager();

let pluginSettingsDialog;

function hotkeyAsExtension() {
  // "avocapture": {
  //   "name": "search-on-hotkey",
  //   "type": "detector",
  //   "display": "Search on Hotkey",
  //   "settings": {
  //     "defaults": {
  //       "vKey": 111,
  //       "browserName": "NumpadDivide",
  //       "replayDirectory": "~/Videos",
  //       "hotkeyDelayMS": 500
  //     },
  //     "view": {
  //       "entry": "index.html",
  //       "width": 500,
  //       "height": 500
  //     }
  //   }
  // }

  const avocaptureConfig = {
    name: "hotkey-detector",
    type: "detector",
    display: "Hotkey",
    settings: {
      defaults: {
        vKey: 111,
        browserName: "NumpadDivide",
        replayDirectory: path.join(userHomeDir, 'Videos'),
        hotkeyDelayMS: 500
      },
      view: {
        entry: "index.html",
        width: 500,
        height: 500
      }
    }
  }

  return new LoadedExtension(hotkeyReplayDetector, avocaptureConfig,
    path.resolve(__dirname, "views", "hotkey")
  );
}

// Load built ins first
const builtIns = path.resolve(__dirname, "builtin");
extensionManager.loadExtensions(builtIns)
extensionManager.tempPut(hotkeyAsExtension())

// TODO get app settings, pick last picked extension
// TODO load to UI

function notifyUploader(data) {
  uploader.upload(data);
}

function logOn(name, data) {
  console.log(`Received [${name}]`, data);
}

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: true,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // mainWindow.removeMenu();
  mainWindow.setIcon(
    path.resolve(__dirname, "images", "logo_256.png")
  );

  extensionManager.setMainWindow(mainWindow);
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

  // TODO include selected detector, uploader
  const appSettings = appSettingsStore.get();
  const currSettings = {
    ...appSettings,
    detectors: extensionManager.getExtensions("detector"),
    uploaders: extensionManager.getExtensions("uploader")
  }

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('AppSettings.Initialize', currSettings);
  });

  replayDetectionListener.setPrefix(appSettings.prefix);
  uploader.initialize();

  // const settings = pluginSettingsStore.get('hotkey-detector');
  // TODO get this from settings
  extensionManager.activate("hotkey-detector");

  // todo get active detector
  //hotkeyReplayDetector.initialize(settings);
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
  mainWindow.webContents.send("ReplayDetails.Add", replaySaver.getReplayData(data.replayUuid));
});

ipcMain.on('AppSettings.Apply', (event, data) => {
  logOn('AppSettings.Apply', data);
  appSettingsStore.save(data);

  replayDetectionListener.setPrefix(data.prefix);
});

ipcMain.on('AppSettings.Apply.Prefix', (event, prefix) => {
  logOn('AppSettings.Apply.Prefix', prefix);
  appSettingsStore.save('prefix', prefix);
  replayDetectionListener.setPrefix(prefix);
});

ipcMain.on('AppSettings.Extension.Select', (event, data) => {
  logOn('AppSettings.Extension.Select', data);

  //  { type , name }

  // save selected extension
  appSettingsStore.save('extensions.selected.' + data.type, data.name);

  // deactivate old extension
  // activate new extension
});

ipcMain.on('select-directory', async (event, arg) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });

  event.sender.send('select-directory-response', result.filePaths);
  // Set it back to focus
  // TODO figure switching this bit / where to place it
  pluginSettingsDialog.focus();
});
