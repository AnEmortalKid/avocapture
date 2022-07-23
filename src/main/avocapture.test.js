import { ipcMain, Menu, app } from "electron";

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
let mock_getAllWindows = jest.fn();

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
        getAllWindows: mock_getAllWindows,
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
      quit: jest.fn()
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

let mock_ReplayDetailsDialog = {
  destroy: jest.fn()
}
jest.mock("./entry/replayDetailsDialog", () => {
  return {
    ReplayDetailsDialog: jest.fn().mockImplementation(() => {
      return {
        destroy: () => mock_ReplayDetailsDialog.destroy()
      }
    })
  }
});

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
  shutdown: jest.fn()
};
jest.mock("./extensions/management/extensionmanager", () => {
  return jest.fn().mockImplementation(() => {
    return {
      registerChangeListener: (cl) =>
        mock_ExtensionManager.registerChangeListener(cl),
      getExtensionsOfType: (t) => mock_ExtensionManager.getExtensionsOfType(t),
      loadInstalled: () => mock_ExtensionManager.loadInstalled(),
      getExtension: (e) => mock_ExtensionManager.getExtension(e),
      shutdown: () => mock_ExtensionManager.shutdown()
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
  log: jest.fn(),
  logMethod: jest.fn()
};
jest.mock("./logger/logger", () => {
  return jest.fn().mockImplementation(() => {
    return {
      logEvent: (e, d) => mock_Logger.logEvent(e, d),
      log: (d) => mock_Logger.log(d),
      logMethod: (m, d) => mock_Logger.logMethod(m, d)
    };
  });
});

import { runApp } from "./avocapture";
import { ReplayDetailsEvents } from "./entry/replayDetailsEvents";
import { AppEvents } from "./events/appEvents";
import { EventEmitter } from "events";

describe("Avocapture Application", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("initialization", () => {
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

    test("destroys and terminates resources when all windows close", () => {
      const emitter = new EventEmitter();
      mock_app_on.mockImplementation((e, cb) => {
        emitter.on(e, cb);
      });

      runApp();

      emitter.emit("window-all-closed");

      expect(mock_ReplayDetailsDialog.destroy).toHaveBeenCalled();
      expect(mock_ExtensionManager.shutdown).toHaveBeenCalled();
      expect(app.quit).toHaveBeenCalled();
    });
  });

  describe("app.whenReady does all the things", () => {

    beforeEach(() => {
      mock_whenReady_then.mockImplementation((cb) => cb());
      global.MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY = "mainPreload.js";
      global.MAIN_WINDOW_WEBPACK_ENTRY = "main.html";
      Menu.setApplicationMenu = jest.fn();
    });

    test("do it", () => {
      // set empty bulitns
      fs.readdirSync.mockReturnValue([]);

      runApp();
    });

    test("creates main window", () => {


      // todo sets up on('did-finish-loading' on webcontents)
    });

    test("on did-finish-loading initializes app with settings", () => {

      expect(mock_webContents.send).toHaveBeenCalled("AppSettings.Initialize", {
        // add some curr setting
        // add a fake detector and uploader
      })
    })

    test("adds on activate event", () => {

    });

    test("installs built in extensions", () => {

      // expect(extensionmanager.install);
    })

    test("loads installed and registers listener", () => {

    });

    test('calls setPrefix with the configured prefix', () => {

    });

    describe("Activates extensions", () => {
      test("activates detector and registers", () => {

      });
      test("activates uploader", () => {

      });

    });

    describe("Handles events", () => {

      test("on cancel dialog", () => {
        // hides dialog
      })

      test("on apply dialog", () => {

        // hides dialog
        // calls saver
        // calls uploader if available
        // downstream calls APP.ADD
      });

      // TODO Deleting this handler
      // test("on apply settings", () => {});

      test("on apply prefix", () => {
        // saves new prefix
      })

      test('on select directory', () => {
        // displays dialog
        // sends result to caller
      })
    });

  });
});
