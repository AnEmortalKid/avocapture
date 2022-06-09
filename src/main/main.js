const { app, BrowserWindow, ipcMain, dialog } = require('electron')

import { ReplayDetectionListener } from './detector/replayDetectionListener';
import { HotkeyReplayDetector } from './detector/hotkeyReplayDetector';
import { ReplayDetailsDialog } from "./entry/replayDetailsDialog"
import { ConsoleUploader } from './uploader/consoleUploderExtension';
import { ReplayDetailsEvents } from './entry/replayDetailsEvents';
import { ReplaySaver } from './saver/replaySaver';
import { AppSettings } from './settings/appSettings';
import { ExtensionSettingsDialog } from './extensions/extensionSettingsDialog';
import { ExtensionEvents } from './extensions/extensionEvents';
import { PluginSettingsStore } from './settings/pluginSettings';
import ExtensionLoader from './extensions/loader/extensionLoader';
import LoadedExtension from './extensions/loader/loadedExtension';

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

let pluginSettingsDialog;

let currentPluginContext = {
  pluginName: null,
  plugin: null
}

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
const builtInExtensions = extensionLoader.loadExtensions(builtIns);

const extensions = {}
const hkExt = hotkeyAsExtension()
extensions[hkExt.name()] = hkExt

// TODO remove hardcoded once extensions are done
const detectorNames = [{ pluginName: "hotkey-detector", displayName: "Hotkey" }];
const uploaderNames = [];
// TODO deal with the other plugins dir at some point
for (var builtIn of builtInExtensions) {
  extensions[builtIn.name()] = builtIn

  const pluginObj = {
    pluginName: builtIn.name(),
    displayName: builtIn.display()
  }

  if (builtIn.type() === "detector") {
    detectorNames.push(pluginObj)
  }
  if (builtIn.type() === "uploader") {
    uploaderNames.push(pluginObj)
  }
}

function getExtension(extensionName) {
  return extensions[extensionName].instance
}

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

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // mainWindow.removeMenu();

  mainWindow.setIcon(
    path.resolve(__dirname, "images", "logo_256.png")
  );
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
    detectors: detectorNames,
    uploaders: uploaderNames
  }

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('AppSettings.Initialize', currSettings);
  });

  replayDetectionListener.setPrefix(appSettings.prefix);
  uploader.initialize();

  const settings = pluginSettingsStore.get('hotkey-detector');
  hotkeyReplayDetector.initialize(settings);
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

function pluginApply(data) {
  const { pluginName, plugin } = currentPluginContext;
  pluginSettingsStore.save(pluginName, data.settings);
  plugin.notifyModifyApply(data.settings);

  pluginSettingsDialog.destroy();
  currentPluginContext = {}
}

function pluginCancel() {
  const { plugin } = currentPluginContext;

  plugin.notifyModifyCancel();
  pluginSettingsDialog.destroy();
  currentPluginContext = {}
}

ipcMain.on(ExtensionEvents.PLUGIN_SETTINGS.APPLY, (event, data) => {
  logOn(ExtensionEvents.PLUGIN_SETTINGS.APPLY, data);
  pluginApply(data);
});

ipcMain.on(ExtensionEvents.PLUGIN_SETTINGS.CANCEL, (event, data) => {
  logOn(ExtensionEvents.PLUGIN_SETTINGS.CANCEL);
  pluginCancel();
});

ipcMain.on(ExtensionEvents.PLUGIN_SETTINGS.INITIALIZE, (event, data) => {
  logOn(ExtensionEvents.PLUGIN_SETTINGS.INITIALIZE, data);

  const pluginName = data.pluginName;
  const pluginSettings = pluginSettingsStore.get(pluginName);
  const extensionSettings = extensions[pluginName].configuration.settings;

  // TODO consolidate these, formalize
  const dialogViewSettings = {
    viewPath: path.join(extensions[pluginName].extensionPath, extensionSettings.view.entry),
    dimensions: {
      width: extensionSettings.view.width,
      height: extensionSettings.view.height
    }
  }

  pluginSettingsDialog = new ExtensionSettingsDialog({
    pluginName: pluginName,
    settings: pluginSettings,
    displaySettings: dialogViewSettings
  }, mainWindow, pluginCancel);

  const currentPlugin = getExtension(pluginName)
  currentPluginContext = {
    pluginName: pluginName, plugin: currentPlugin
  }
  currentPlugin.notifyModifying();
});

ipcMain.on('select-directory', async (event, arg) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });

  event.sender.send('select-directory-response', result.filePaths);
  // Set it back to focus
  pluginSettingsDialog.focus();
});
