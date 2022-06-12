const { app, BrowserWindow, ipcMain, dialog } = require('electron')

import { ReplayDetectionListener } from './detector/replayDetectionListener';
import { HotkeyReplayDetector } from './detector/hotkeyReplayDetector';
import { ReplayDetailsDialog } from "./entry/replayDetailsDialog"
import { ConsoleUploader } from './uploader/consoleUploderExtension';
import { ReplayDetailsEvents } from './entry/replayDetailsEvents';
import { ReplaySaver } from './saver/replaySaver';
import { AppSettings } from './settings/appSettings';
import { PluginSettingsStore } from './settings/pluginSettings';
import LoadedExtension from './extensions/loader/loadedExtension';
import ExtensionManager from './extensions/extensionManager';
import ExtensionSettingsApp from './extensions/extensionSettingsApp';
import logOn from './logger/eventLogger';
import { AppEvents } from './events/appEvents';

const path = require('path')
const fs = require('fs');

const os = require("os");
const userHomeDir = os.homedir();


const appSettingsStore = new AppSettings();

const replayDialog = new ReplayDetailsDialog();
const replaySaver = new ReplaySaver();
const replayDetectionListener = new ReplayDetectionListener(replayDialog, replaySaver);

const hotkeyReplayDetector = new HotkeyReplayDetector();

const uploader = new ConsoleUploader();

const extensionManager = new ExtensionManager();
const extensionsApp = new ExtensionSettingsApp(extensionManager);

function hotkeyAsExtension() {
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

  extensionsApp.setMainWindow(mainWindow);
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

  const appSettings = appSettingsStore.getAll();
  const currSettings = {
    ...appSettings,
    detectors: extensionManager.getExtensions("detector"),
    uploaders: extensionManager.getExtensions("uploader")
  }

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('AppSettings.Initialize', currSettings);
  });

  replayDetectionListener.setPrefix(appSettings.prefix);

  const selectedByType = appSettings.extensions?.selected;
  if (selectedByType.detector) {
    extensionManager.activate(selectedByType.detector);
    const detector = extensionManager.getExtension(selectedByType.detector);
    detector.instance.register(replayDetectionListener);
  }

  if (selectedByType.uploader) {
    extensionManager.activate(selectedByType.uploader);
  }

})

ipcMain.on(ReplayDetailsEvents.DIALOG.CANCEL, (event, data) => {
  logOn(ReplayDetailsEvents.DIALOG.CANCEL, data);
  replayDialog.destroy();
});

ipcMain.on(ReplayDetailsEvents.DIALOG.APPLY, (event, data) => {
  logOn(ReplayDetailsEvents.DIALOG.APPLY, data);

  replayDialog.destroy();
  notifyUploader(data);
  console.log('send event');
  replaySaver.setTitle(data);
  mainWindow.webContents.send("ReplayDetails.Add", replaySaver.getReplayData(data.replayUuid));
});

ipcMain.on(AppEvents.SETTINGS.APPLY, (event, data) => {
  logOn(AppEvents.SETTINGS.APPLY, data);
  appSettingsStore.save(data);

  replayDetectionListener.setPrefix(data.prefix);
});

ipcMain.on(AppEvents.SETTINGS.APPLY_PREFIX, (event, prefix) => {
  logOn(AppEvents.SETTINGS.APPLY_PREFIX, prefix);
  appSettingsStore.save('prefix', prefix);
  replayDetectionListener.setPrefix(prefix);
});

ipcMain.on(AppEvents.SETTINGS.SELECT_EXTENSION, (event, data) => {
  logOn(AppEvents.SETTINGS.SELECT_EXTENSION, data);

  //  { type , name }
  const old = appSettingsStore.get('extensions.selected.' + data.type);
  appSettingsStore.save('extensions.selected.' + data.type, data.name);
  // going from none to something, old would be null
  if (old) {
    extensionManager.deactivate(old);
  }

  // allow selecting none
  if (data.name) {
    extensionManager.activate(data.name);

    if (data.type === "detector") {
      const detector = extensionManager.getExtension(data.name);
      detector.instance.register(replayDetectionListener);
    }
  }
});
