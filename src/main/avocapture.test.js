import { ipcMain, Menu } from "electron";

let mock_setBackgroundColor = jest.fn();
let mock_setAlwaysOnTop = jest.fn();
let mock_setVisibleOnAllWorkspaces = jest.fn();
let mock_setFullScreenable = jest.fn();
let mock_loadURL = jest.fn();
let mock_once = jest.fn();
let mock_on = jest.fn();
let mock_close = jest.fn();
let mock_show = jest.fn();
let mock_minimize = jest.fn();
let mock_hide = jest.fn();
let mock_app_on = jest.fn();
let mock_setIcon = jest.fn();

let mock_webContents = {
  on: jest.fn(),
  send: jest.fn(),
};

let mock_Menu_append = jest.fn();

let mock_whenReady_then = jest.fn();
jest.mock("electron", () => {
  return {
    BrowserWindow: jest.fn().mockImplementation(() => {
      return {
        setBackgroundColor: mock_setBackgroundColor,
        setAlwaysOnTop: mock_setAlwaysOnTop,
        setVisibleOnAllWorkspaces: mock_setVisibleOnAllWorkspaces,
        setFullScreenable: mock_setFullScreenable,
        loadURL: mock_loadURL,
        once: mock_once,
        close: mock_close,
        on: mock_on,
        show: mock_show,
        minimize: mock_minimize,
        hide: mock_hide,
        setIcon: mock_setIcon,
        webContents: mock_webContents,
      };
    }),
    ipcMain: {
      on: jest.fn(),
    },
    app: {
      isPackaged: true,
      getName: jest.fn(),
      getVersion: jest.fn(),
      getPath: jest.fn().mockReturnValue("testAppPath"),
      on: (e, cb) => mock_app_on(e, cb),
      whenReady: jest.fn().mockImplementation(() => {
        return {
          then: mock_whenReady_then,
        };
      }),
    },
    Menu: jest.fn().mockImplementation(() => {
      return {
        append: mock_Menu_append,
      };
    }),
    MenuItem: jest.fn().mockImplementation(() => {
      return {};
    }),
  };
});

jest.mock("./settings/appSettings", () => {
  return {
    AppSettings: jest.fn().mockImplementation(() => {
      return {
        clear: jest.fn(),
        getAll: jest.fn().mockReturnValue({
          prefix: "prefix",
        }),
      };
    }),
  };
});

jest.mock("fs");
const fs = require("fs");

import { logCleaner } from "./logger/logCleaner";
jest.mock("./logger/logCleaner");

import { ReplayDetailsDialog } from "./entry/replayDetailsDialog";
jest.mock("./entry/replayDetailsDialog");

import { ReplaySaver } from "./saver/replaySaver";
jest.mock("./saver/replaySaver");

import { ReplayDetectionListener } from "./detector/replayDetectionListener";
jest.mock("./detector/replayDetectionListener");

let mock_loadedExtension = {
  markBuiltIn: jest.fn(),
};

let mock_ExtensionManager = {
  registerChangeListener: jest.fn(),
  getExtensionsOfType: jest.fn(),
  loadInstalled: jest.fn(),
  getExtension: jest.fn().mockReturnValue(mock_loadedExtension),
};
jest.mock("./extensions/management/extensionmanager", () => {
  return jest.fn().mockImplementation(() => {
    return {
      registerChangeListener: (cl) =>
        mock_ExtensionManager.registerChangeListener(cl),
      getExtensionsOfType: (t) => mock_ExtensionManager.getExtensionsOfType(t),
      loadInstalled: () => mock_ExtensionManager.loadInstalled(),
      getExtension: (e) => mock_ExtensionManager.getExtension(e),
    };
  });
});

let mock_ExtensionSettingsApp = {
  setMainWindow: jest.fn(),
};
jest.mock("./extensions/settings/extensionSettingsApp", () => {
  return jest.fn().mockImplementation(() => {
    return {
      setMainWindow: (cl) => mock_ExtensionSettingsApp.setMainWindow(cl),
    };
  });
});

let mock_ExtensionManagementApp = {
  manage: jest.fn(),
};
jest.mock("./extensions/management/extensionManagementApp", () => {
  return jest.fn().mockImplementation(() => {
    return {
      manage: (bw) => mock_ExtensionManagementApp.manage(bw),
    };
  });
});

let mock_Logger = {
  logEvent: jest.fn(),
};
jest.mock("./logger/logger", () => {
  return jest.fn().mockImplementation(() => {
    return {
      logEvent: (e, d) => mock_Logger.logEvent(e, d),
    };
  });
});

import { runApp } from "./avocapture";
import { ReplayDetailsEvents } from "./entry/replayDetailsEvents";
import { AppEvents } from "./events/appEvents";

describe("Avocapture Application", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("initialization", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    test("cleans up logs", () => {
      runApp();

      expect(logCleaner).toHaveBeenCalled();
    });

    test("sets listeners", () => {
      runApp();

      // sets replay events
      expect(ipcMain.on).toHaveBeenCalledWith(
        ReplayDetailsEvents.DIALOG.CANCEL,
        expect.any(Function)
      );
      expect(ipcMain.on).toHaveBeenCalledWith(
        ReplayDetailsEvents.DIALOG.APPLY,
        expect.any(Function)
      );

      // sets app settings events
      expect(ipcMain.on).toHaveBeenCalledWith(
        AppEvents.SETTINGS.APPLY,
        expect.any(Function)
      );
      expect(ipcMain.on).toHaveBeenCalledWith(
        AppEvents.SETTINGS.APPLY_PREFIX,
        expect.any(Function)
      );
      expect(ipcMain.on).toHaveBeenCalledWith(
        AppEvents.SETTINGS.SELECT_EXTENSION,
        expect.any(Function)
      );

      // sets action events
      expect(ipcMain.on).toHaveBeenCalledWith(
        AppEvents.ACTIONS.SELECT_DIRECTORY,
        expect.any(Function)
      );
    });

    test("binds a window-all-closed listener", () => {
      runApp();

      expect(mock_app_on).toHaveBeenCalledWith(
        "window-all-closed",
        expect.any(Function)
      );
    });
  });

  describe("app.whenReady does all the things", () => {
    mock_whenReady_then.mockImplementation((cb) => cb());
    global.MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY = "mainPreload.js";
    global.MAIN_WINDOW_WEBPACK_ENTRY = "main.html";
    Menu.setApplicationMenu = jest.fn();
    // set empty bulitns
    fs.readdirSync.mockReturnValue([]);

    runApp();
  });
});
