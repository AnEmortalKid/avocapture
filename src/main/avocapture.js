const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Menu,
  MenuItem,
} = require("electron");

import { ReplayDetectionListener } from "./detector/replayDetectionListener";
import { ReplayDetailsDialog } from "./entry/replayDetailsDialog";
import { ReplayDetailsEvents } from "./entry/replayDetailsEvents";
import { ReplaySaver } from "./saver/replaySaver";
import { AppSettings } from "./settings/appSettings";
import ExtensionManager from "./extensions/management/extensionManager";
import ExtensionSettingsApp from "./extensions/settings/extensionSettingsApp";
import { AppEvents } from "./events/appEvents";
import ExtensionManagementApp from "./extensions/management/extensionManagementApp";
import { isProduction } from "./util/processInfo";
import Logger from "./logger/logger";
import { logCleaner } from "./logger/logCleaner";
import { AppLoader } from "./loader/appLoader";

export function runApp() {
  const isMac = process.platform === "darwin";

  logCleaner();
  const logger = new Logger("MainApp");

  const path = require("path");
  const fs = require("fs");

  const appSettingsStore = new AppSettings();

  const replayDialog = new ReplayDetailsDialog();
  const replaySaver = new ReplaySaver();
  const replayDetectionListener = new ReplayDetectionListener(
    replayDialog,
    replaySaver
  );

  const extensionManager = new ExtensionManager();
  const extensionsApp = new ExtensionSettingsApp(extensionManager);
  const extensionManagementApp = new ExtensionManagementApp(extensionManager);
  const appLoader = new AppLoader();

  async function installBuiltins() {
    const builtIns = path.resolve(__dirname, "builtin");
    const files = fs.readdirSync(builtIns, { withFileTypes: true });

    for (var file of files) {
      await extensionManager.install(path.join(builtIns, file.name));
    }
  }

  function extensionChangeListener(eventData) {
    logger.logMethod("extensionChangeListener", eventData);

    if (eventData.event == "install") {
      mainWindow.webContents.send(
        "App.Initialize",
        "Installing " + eventData.name + ". This may take a while."
      );
      return;
    }

    let appSettings = appSettingsStore.getAll();
    if (eventData.event === "uninstall") {
      const selectedByType = appSettings.extensions?.selected;

      if (selectedByType[eventData.type] === eventData.name) {
        appSettingsStore.clear("extensions.selected." + eventData.type);
        // update
        appSettings = appSettingsStore.getAll();
      }
    }

    // reload data
    const currSettings = {
      ...appSettings,
      detectors: extensionManager.getExtensionsOfType("detector"),
      uploaders: extensionManager.getExtensionsOfType("uploader"),
    };
    mainWindow.webContents.send("AppSettings.Initialize", currSettings);
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
    });

    mainWindow.setIcon(path.resolve(__dirname, "images", "logo_256.png"));

    const appMenu = new Menu();
    const fileItems = new MenuItem({
      label: "File",
      submenu: [isMac ? { role: "close" } : { role: "quit" }],
    });

    const extensionsMenu = new Menu();
    const item = new MenuItem({
      label: "Manage",
      click: (MenuItem, browserWindow, event) => {
        extensionManagementApp.manage(browserWindow);
      },
    });
    extensionsMenu.append(item);
    const extensionsMenuItem = new MenuItem({
      label: "Extensions",
      submenu: extensionsMenu,
    });

    const view = new MenuItem({
      label: "View",
      submenu: [{ role: "toggleDevTools" }],
    });

    appMenu.append(fileItems);
    appMenu.append(extensionsMenuItem);
    if (!isProduction()) {
      appMenu.append(view);
    }
    Menu.setApplicationMenu(appMenu);

    extensionsApp.setMainWindow(mainWindow);

    mainWindow.once("close", () => {
      logger.log("Received close.");
      closeAndQuit();
    });
  };

  function closeAndQuit() {
    if (process.platform !== "darwin") {
      replayDialog.destroy();
      extensionManager.shutdown();
      app.quit();
    }
  }

  app.on("window-all-closed", () => {
    logger.log("Received window-all-closed.");
    closeAndQuit();
  });

  app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });

    const appSettings = appSettingsStore.getAll();
    const currSettings = {
      ...appSettings,
      detectors: extensionManager.getExtensionsOfType("detector"),
      uploaders: extensionManager.getExtensionsOfType("uploader"),
    };
    replayDetectionListener.setPrefix(appSettings.prefix);

    appLoader.onFinished(() => {
      mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
      mainWindow.webContents.on("did-finish-load", () => {
        mainWindow.webContents.send("AppSettings.Initialize", currSettings);
      });
    });

    mainWindow.loadURL(
      path.join(__dirname, "views", "loading", "loading.html")
    );
    mainWindow.webContents.once("did-finish-load", async () => {
      await appLoader.load(() => {
        // start to get notified about any changes
        extensionManager.registerChangeListener(extensionChangeListener);
        installBuiltins();

        mainWindow.webContents.send("App.Initialize", "Loading extensions");
        extensionManager.loadInstalled();

        mainWindow.webContents.send("App.Initialize", "Loading Settings");
        const selectedByType = appSettings.extensions?.selected;
        if (selectedByType?.detector) {
          extensionManager.activate(selectedByType.detector);
          const detector = extensionManager.getExtension(
            selectedByType.detector
          );
          detector.instance.register(replayDetectionListener);
        }

        if (selectedByType?.uploader) {
          extensionManager.activate(selectedByType.uploader);
        }
      });
    });
  });

  ipcMain.on(ReplayDetailsEvents.DIALOG.CANCEL, (event, data) => {
    logger.logEvent(ReplayDetailsEvents.DIALOG.CANCEL, data);
    replayDialog.hide();
  });

  ipcMain.on(ReplayDetailsEvents.DIALOG.APPLY, (event, data) => {
    logger.logEvent(ReplayDetailsEvents.DIALOG.APPLY, data);

    replayDialog.hide();
    replaySaver.setTitle(data);
    const replayData = replaySaver.getReplayData(data.replayUuid);

    // get uploader extension
    const selectedUploader = appSettingsStore.get(
      "extensions.selected.uploader"
    );
    if (selectedUploader) {
      extensionManager
        .getExtension(selectedUploader)
        .instance.upload(replayData);
    }

    mainWindow.webContents.send(ReplayDetailsEvents.APP.ADD, replayData);
  });

  ipcMain.on(AppEvents.SETTINGS.APPLY_PREFIX, (event, prefix) => {
    logger.logEvent(AppEvents.SETTINGS.APPLY_PREFIX, prefix);
    appSettingsStore.save("prefix", prefix);
    replayDetectionListener.setPrefix(prefix);
  });

  ipcMain.on(AppEvents.SETTINGS.SELECT_EXTENSION, (event, data) => {
    logger.logEvent(AppEvents.SETTINGS.SELECT_EXTENSION, data);

    //  { type , name }
    const old = appSettingsStore.get("extensions.selected." + data.type);
    appSettingsStore.save("extensions.selected." + data.type, data.name);
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

  ipcMain.on(AppEvents.ACTIONS.SELECT_DIRECTORY, async (event, data) => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
    });

    const selectedDir =
      result.filePaths.length > 0 ? result.filePaths[0] : null;
    event.sender.send(AppEvents.ACTIONS.SELECT_DIRECTORY_RESPONSE, selectedDir);
    event.sender.focus();
  });
}
