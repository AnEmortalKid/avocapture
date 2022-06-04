const { app, BrowserWindow, ipcMain } = require('electron')

import { ReplayDetectionListener } from './detector/replayDetectionListener';
import { HotkeyReplayDetector } from './detector/hotkeyReplayDetector';
import { ReplayDetailsDialog } from "./entry/replayDetailsDialog"
import { ConsoleUploader } from './uploader/consoleUploderExtension';
import { ReplayDetailsEvents } from './entry/replayDetailsEvents';
import { ReplaySaver } from './saver/replaySaver';
import { HotkeySettingsDialog } from './detector/settings/hotkeySettingsDialog';
import { AppSettings } from './settings/appSettings';
import { ExtensionSettingsDialog } from './extensions/extensionSettingsDialog';
import { ExtensionEvents } from './extensions/extensionEvents';
import { PluginSettingsStore } from './settings/pluginSettings';

const path = require('path')
const fs = require('fs');

// TODO dir config
const os = require("os");
const userHomeDir = os.homedir();


const appSettingsStore = new AppSettings();
const pluginSettingsStore = new PluginSettingsStore();

const replayDialog = new ReplayDetailsDialog();
const replaySaver = new ReplaySaver();
const replayDetectionListener = new ReplayDetectionListener(replayDialog, replaySaver);

const hotkeyReplayDetector = new HotkeyReplayDetector();
const hotkeySettingsDialog = new HotkeySettingsDialog();
const uploader = new ConsoleUploader();

let pluginSettingsDialog;
let currentPlugin;

const plugins = {};

// TODO save picked extensions

// TODO load plugins
plugins["hotkey-detector"] = hotkeyReplayDetector;

pluginSettingsStore.setDefaults("hotkey-detector", {
  vKey: 111,
  browserName: "NumpadDivide",
  replayDirectory: path.join(userHomeDir, 'Videos'),
  timeoutMS: 500
});

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

  win.removeMenu();

  // Open the DevTools.
  // win.webContents.openDevTools();
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

  const appSettings = appSettingsStore.get();
  win.webContents.on('did-finish-load', () => {
    win.webContents.send('AppSettings.Initialize', appSettings);
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
  win.webContents.send("ReplayDetails.Add", replaySaver.getReplayData(data.replayUuid));
});

ipcMain.on('AppSettings.Apply', (event, data) => {
  logOn('AppSettings.Apply', data);
  appSettingsStore.save(data);

  replayDetectionListener.setPrefix(data.prefix);
});

// TODO event must have { pluginName, settings }
ipcMain.on(ExtensionEvents.PLUGIN_SETTINGS.APPLY, (event, data) => {
  logOn(ExtensionEvents.PLUGIN_SETTINGS.APPLY, data);

  // TODO get plugin name / current saving context somehow
  const pluginName = currentPlugin.name();
  pluginSettingsStore.save(pluginName, data.settings);
  currentPlugin.notifyModifyApply(data.settings);
  pluginSettingsDialog.destroy();
  currentPlugin = null;
});

ipcMain.on(ExtensionEvents.PLUGIN_SETTINGS.CANCEL, (event, data) => {
  logOn(ExtensionEvents.PLUGIN_SETTINGS.CANCEL);

  // TODO get plugin name
  currentPlugin.notifyModifyCancel();
  pluginSettingsDialog.destroy();
  currentPlugin = null;
});

ipcMain.on(ExtensionEvents.PLUGIN_SETTINGS.MODIFY, (event, data) => {
  logOn(ExtensionEvents.PLUGIN_SETTINGS.MODIFY, data);

  // TODO get plugin name
  currentPlugin.notifyModifying();
});

ipcMain.on(ExtensionEvents.PLUGIN_SETTINGS.INITIALIZE, (event, data) => {
  logOn(ExtensionEvents.PLUGIN_SETTINGS.INITIALIZE, data);

  const pluginName = data.pluginName;
  const pluginSettings = pluginSettingsStore.get(pluginName);

  pluginSettingsDialog = new ExtensionSettingsDialog({
    pluginName: pluginName,
    settings: pluginSettings
  });

  currentPlugin = getPlugin(pluginName);
  currentPlugin.notifyModifying();
});