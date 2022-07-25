import { ipcMain, Menu, app, BrowserWindow, MenuItem } from "electron";

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

let mock_dialog = {
  showOpenDialog: jest.fn(),
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
      quit: jest.fn(),
    },
    Menu: jest.fn().mockImplementation(() => {
      return {
        append: mock_Menu_append,
      };
    }),
    MenuItem: jest.fn().mockImplementation(() => {
      return {};
    }),
    dialog: {
      showOpenDialog: (w, o) => mock_dialog.showOpenDialog(w, o),
    },
  };
});

let mock_AppSettings = {
  save: jest.fn(),
  get: jest.fn(),
  getAll: jest.fn(),
  clear: jest.fn(),
};
jest.mock("./settings/appSettings", () => {
  return {
    AppSettings: jest.fn().mockImplementation(() => {
      return {
        clear: jest.fn(),
        getAll: jest.fn().mockReturnValue({
          prefix: "prefix",
        }),
        save: (k, d) => mock_AppSettings.save(k, d),
        get: (k) => mock_AppSettings.get(k),
        getAll: () => mock_AppSettings.getAll(),
        clear: (k) => mock_AppSettings.clear(k),
      };
    }),
  };
});

jest.mock("fs");
const fs = require("fs");

import { logCleaner } from "./logger/logCleaner";
jest.mock("./logger/logCleaner");

let mock_ReplayDetailsDialog = {
  destroy: jest.fn(),
  hide: jest.fn(),
};
jest.mock("./entry/replayDetailsDialog", () => {
  return {
    ReplayDetailsDialog: jest.fn().mockImplementation(() => {
      return {
        destroy: () => mock_ReplayDetailsDialog.destroy(),
        hide: () => mock_ReplayDetailsDialog.hide(),
      };
    }),
  };
});

let mock_ReplaySaver = {
  setTitle: jest.fn(),
  getReplayData: jest.fn(),
};
jest.mock("./saver/replaySaver", () => {
  return {
    ReplaySaver: jest.fn().mockImplementation(() => {
      return {
        setTitle: (t) => mock_ReplaySaver.setTitle(t),
        getReplayData: (uuid) => mock_ReplaySaver.getReplayData(uuid),
      };
    }),
  };
});

let mock_ReplayDetectionListener = {
  setPrefix: jest.fn(),
};
import { ReplayDetectionListener } from "./detector/replayDetectionListener";
jest.mock("./detector/replayDetectionListener", () => {
  return {
    ReplayDetectionListener: jest.fn().mockImplementation(() => {
      return {
        setPrefix: (p) => mock_ReplayDetectionListener.setPrefix(p),
      };
    }),
  };
});

let mock_loadedExtension = {
  markBuiltIn: jest.fn(),
};

let mock_ExtensionManager = {
  registerChangeListener: jest.fn(),
  getExtensionsOfType: jest.fn(),
  loadInstalled: jest.fn(),
  getExtension: jest.fn().mockReturnValue(mock_loadedExtension),
  shutdown: jest.fn(),
  install: jest.fn(),
  activate: jest.fn(),
  deactivate: jest.fn(),
};
jest.mock("./extensions/management/extensionManager", () => {
  return jest.fn().mockImplementation(() => {
    return {
      registerChangeListener: (cl) =>
        mock_ExtensionManager.registerChangeListener(cl),
      getExtensionsOfType: (t) => mock_ExtensionManager.getExtensionsOfType(t),
      loadInstalled: () => mock_ExtensionManager.loadInstalled(),
      getExtension: (e) => mock_ExtensionManager.getExtension(e),
      shutdown: () => mock_ExtensionManager.shutdown(),
      install: (e) => mock_ExtensionManager.install(e),
      activate: (e) => mock_ExtensionManager.activate(e),
      deactivate: (e) => mock_ExtensionManager.deactivate(e),
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
  logMethod: jest.fn(),
};
jest.mock("./logger/logger", () => {
  return jest.fn().mockImplementation(() => {
    return {
      logEvent: (e, d) => mock_Logger.logEvent(e, d),
      log: (d) => mock_Logger.log(d),
      logMethod: (m, d) => mock_Logger.logMethod(m, d),
    };
  });
});

import { isProduction } from "./util/processInfo";
jest.mock("./util/processInfo");

import { runApp } from "./avocapture";
import { ReplayDetailsEvents } from "./entry/replayDetailsEvents";
import { AppEvents } from "./events/appEvents";
import { EventEmitter } from "events";
import { ReplayDetailsDialog } from "./entry/replayDetailsDialog";

const fakeEvent = {
  type: "fakeEvent",
};
const path = require("path");

// for when someone runs it on mac
const isMac = process.platform === "darwin";

describe("Avocapture Application", () => {
  beforeEach(() => {
    // pretend all built ins are loaded
    mock_ExtensionManager.getExtension.mockReturnValue(mock_loadedExtension);
  });

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

  describe("app.whenReady runs application", () => {
    beforeEach(() => {
      mock_whenReady_then.mockImplementation((cb) => cb());
      global.MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY = "mainPreload.js";
      global.MAIN_WINDOW_WEBPACK_ENTRY = "main.html";
      Menu.setApplicationMenu = jest.fn();
      // set empty bulitns
      fs.readdirSync.mockReturnValue([]);
      isProduction.mockReturnValue(true);

      mock_AppSettings.getAll.mockReturnValue({
        prefix: "thePrefix",
      });
    });

    test("creates main window", () => {
      runApp();

      expect(BrowserWindow).toHaveBeenCalledWith({
        width: 800,
        height: 600,
        frame: true,
        webPreferences: {
          preload: "mainPreload.js",
          nodeIntegration: true,
          contextIsolation: false,
        },
      });
      expect(mock_loadURL).toHaveBeenCalledWith("main.html");
      expect(mock_setIcon).toHaveBeenCalledWith(
        path.resolve(__dirname, "images", "logo_256.png")
      );

      expect(mock_once).toHaveBeenCalledWith("close", expect.any(Function));

      // Check menu creation
      expect(MenuItem).toHaveBeenCalledWith({
        label: "File",
        submenu: [isMac ? { role: "close" } : { role: "quit" }],
      });
      expect(MenuItem).toHaveBeenCalledWith({
        label: "Manage",
        click: expect.any(Function),
      });
      expect(MenuItem).toHaveBeenCalledWith({
        label: "Extensions",
        submenu: expect.anything(),
      });
      expect(Menu.setApplicationMenu).toHaveBeenCalled();
      expect(mock_ExtensionSettingsApp.setMainWindow).toHaveBeenCalledWith(
        expect.anything()
      );
    });

    test("adds dev tools when not production", () => {
      isProduction.mockReturnValue(false);

      runApp();

      // adds menu when not in prod
      expect(MenuItem).toHaveBeenCalledWith({
        label: "View",
        submenu: [{ role: "toggleDevTools" }],
      });
    });

    test("on did-finish-loading initializes app with settings", () => {
      const emitter = new EventEmitter();
      mock_webContents.on.mockImplementation((e, cb) => emitter.on(e, cb));

      mock_AppSettings.getAll.mockReturnValue({
        fakeSettings: "true",
      });
      // pretend these are loaded and installed
      mock_ExtensionManager.getExtensionsOfType
        .mockReturnValueOnce(["fake-detector"])
        .mockReturnValueOnce(["fake-uploader"]);

      runApp();
      emitter.emit("did-finish-load");

      expect(mock_webContents.send).toHaveBeenCalledWith(
        "AppSettings.Initialize",
        {
          fakeSettings: "true",
          detectors: ["fake-detector"],
          uploaders: ["fake-uploader"],
        }
      );
    });

    test("on close destroys/shuts down and quits the app", () => {
      const emitter = new EventEmitter();
      mock_once.mockImplementation((e, cb) => emitter.once(e, cb));

      runApp();
      emitter.emit("close");

      expect(mock_ReplayDetailsDialog.destroy).toHaveBeenCalled();
      expect(mock_ExtensionManager.shutdown).toHaveBeenCalled();
      expect(app.quit).toHaveBeenCalled();
    });

    test("adds on activate event", () => {
      runApp();

      expect(mock_app_on).toHaveBeenCalledWith(
        "activate",
        expect.any(Function)
      );
    });

    test("installs built in extensions", () => {
      // add a builtin
      fs.readdirSync.mockReturnValue([
        {
          name: "builtin-extension",
          isDirectory: () => true,
        },
        {
          name: "some-file",
          isDirectory: () => false,
        },
      ]);

      runApp();

      const builtIns = path.resolve(__dirname, "builtin");
      expect(mock_ExtensionManager.install).toHaveBeenCalledWith(
        path.join(builtIns, "builtin-extension")
      );
    });

    test("loads installed and marks built ins", () => {
      runApp();

      expect(mock_ExtensionManager.loadInstalled).toHaveBeenCalled();
      expect(mock_ExtensionManager.registerChangeListener).toHaveBeenCalledWith(
        expect.any(Function)
      );

      expect(mock_ExtensionManager.getExtension).toHaveBeenCalledWith(
        "avocapture-replay-mover"
      );
      expect(mock_ExtensionManager.getExtension).toHaveBeenCalledWith(
        "avocapture-search-on-hotkey"
      );
      expect(mock_ExtensionManager.getExtension).toHaveBeenCalledWith(
        "avocapture-obs-detector"
      );
      expect(mock_loadedExtension.markBuiltIn).toHaveBeenCalledTimes(3);
    });

    test("calls setPrefix with the configured prefix", () => {
      runApp();

      expect(mock_ReplayDetectionListener.setPrefix).toHaveBeenCalledWith(
        "thePrefix"
      );
    });

    test("changeListener updates settings on app uninstall", () => {
      let captured;
      mock_ExtensionManager.registerChangeListener.mockImplementation((cl) => {
        captured = cl;
      });

      mock_AppSettings.getAll
        // initial settings
        .mockReturnValueOnce({
          prefix: "fakePrefix",
          extensions: {
            selected: {
              detector: "loaded-detector",
            },
          },
        })
        // settings for changeListener
        .mockReturnValueOnce({
          prefix: "fakePrefix",
          extensions: {
            selected: {
              detector: "loaded-detector",
            },
          },
        })
        // updated settings after clear
        .mockReturnValue({ prefix: "fakePrefix" });

      mock_ExtensionManager.getExtensionsOfType.mockImplementation((t) => {
        if (t === "detector") {
          return ["fake-detector"];
        }
        return ["fake-uploader"];
      });

      mock_ExtensionManager.getExtension.mockReturnValue({
        instance: {
          register: jest.fn(),
        },
        markBuiltIn: jest.fn(),
      });

      runApp();

      // notify
      captured({
        event: "uninstall",
        type: "detector",
        name: "loaded-detector",
      });

      expect(mock_AppSettings.clear).toHaveBeenCalledWith(
        "extensions.selected.detector"
      );
      expect(mock_webContents.send).toHaveBeenCalledWith(
        "AppSettings.Initialize",
        {
          prefix: "fakePrefix",
          detectors: ["fake-detector"],
          uploaders: ["fake-uploader"],
        }
      );
    });

    describe("Activates extensions", () => {
      test("activates detector and registers", () => {
        mock_AppSettings.getAll.mockReturnValue({
          extensions: {
            selected: {
              detector: "loaded-detector",
            },
          },
        });

        // return a fake extension
        let fakeInstance = {
          register: jest.fn(),
        };
        mock_ExtensionManager.getExtension.mockReturnValue({
          instance: fakeInstance,
          markBuiltIn: jest.fn(),
        });
        runApp();

        expect(mock_ExtensionManager.activate).toHaveBeenCalledWith(
          "loaded-detector"
        );
        expect(fakeInstance.register).toHaveBeenCalled();
      });
      test("activates uploader", () => {
        mock_AppSettings.getAll.mockReturnValue({
          extensions: {
            selected: {
              uploader: "loaded-uploader",
            },
          },
        });

        runApp();

        expect(mock_ExtensionManager.activate).toHaveBeenCalledWith(
          "loaded-uploader"
        );
      });
    });

    describe("Handles events", () => {
      let emitter;
      beforeEach(() => {
        emitter = new EventEmitter();
        ipcMain.on.mockImplementation((e, cb) => emitter.on(e, cb));

        runApp();
      });

      test("on cancel dialog", () => {
        emitter.emit(ReplayDetailsEvents.DIALOG.CANCEL, fakeEvent, {
          some: "data ",
        });

        expect(mock_ReplayDetailsDialog.hide).toHaveBeenCalled();
      });

      test("on apply dialog", () => {
        // pretend an uploader was selected
        mock_AppSettings.get.mockReturnValue("my-uploader");
        const fakeInstance = {
          upload: jest.fn(),
        };
        mock_ExtensionManager.getExtension.mockReturnValue({
          instance: fakeInstance,
          markBuiltIn: jest.fn(),
        });

        const eventData = {
          replayUuid: "testUUID",
          prefix: "prefix",
          name: "replayFile",
        };
        mock_ReplaySaver.getReplayData.mockReturnValue({
          replayData: "test",
        });

        emitter.emit(ReplayDetailsEvents.DIALOG.APPLY, fakeEvent, eventData);

        const replayData = { replayData: "test" };
        expect(mock_ReplayDetailsDialog.hide).toHaveBeenCalled();
        expect(mock_ReplaySaver.setTitle).toHaveBeenCalledWith(eventData);
        expect(mock_ReplaySaver.getReplayData).toHaveBeenCalledWith("testUUID");

        expect(mock_AppSettings.get).toHaveBeenCalledWith(
          "extensions.selected.uploader"
        );
        expect(mock_ExtensionManager.getExtension).toHaveBeenCalledWith(
          "my-uploader"
        );
        expect(fakeInstance.upload).toHaveBeenCalledWith(replayData);

        expect(mock_webContents.send).toHaveBeenCalledWith(
          ReplayDetailsEvents.APP.ADD,
          replayData
        );
      });

      // TODO Deleting this handler
      // test("on apply settings", () => {});

      test("on select extension with new uploader, saves uploader", () => {
        // set old selected
        mock_AppSettings.get.mockReturnValue("old-uploader");

        emitter.emit(AppEvents.SETTINGS.SELECT_EXTENSION, fakeEvent, {
          type: "uploader",
          name: "new-uploader",
        });

        expect(mock_AppSettings.save).toHaveBeenCalledWith(
          "extensions.selected.uploader",
          "new-uploader"
        );
        expect(mock_ExtensionManager.deactivate).toHaveBeenCalledWith(
          "old-uploader"
        );
        expect(mock_ExtensionManager.activate).toHaveBeenCalledWith(
          "new-uploader"
        );
      });

      test("on select extension with no previous uploader", () => {
        // set old selected
        mock_AppSettings.get.mockReturnValue(null);

        emitter.emit(AppEvents.SETTINGS.SELECT_EXTENSION, fakeEvent, {
          type: "uploader",
          name: "an-uploader",
        });

        expect(mock_AppSettings.save).toHaveBeenCalledWith(
          "extensions.selected.uploader",
          "an-uploader"
        );
        expect(mock_ExtensionManager.activate).toHaveBeenCalledWith(
          "an-uploader"
        );
        expect(mock_ExtensionManager.deactivate).not.toHaveBeenCalled();
      });

      test("on select extension with new detector, deactivates and registers", () => {
        // set old selected
        mock_AppSettings.get.mockReturnValue("old-detector");
        let fakeInstance = {
          register: jest.fn(),
        };
        mock_ExtensionManager.getExtension.mockReturnValue({
          instance: fakeInstance,
        });

        emitter.emit(AppEvents.SETTINGS.SELECT_EXTENSION, fakeEvent, {
          type: "detector",
          name: "new-detector",
        });

        expect(mock_AppSettings.save).toHaveBeenCalledWith(
          "extensions.selected.detector",
          "new-detector"
        );
        expect(mock_ExtensionManager.deactivate).toHaveBeenCalledWith(
          "old-detector"
        );
        expect(mock_ExtensionManager.getExtension).toHaveBeenCalledWith(
          "new-detector"
        );
        expect(mock_ExtensionManager.activate).toHaveBeenCalledWith(
          "new-detector"
        );
        expect(fakeInstance.register).toHaveBeenCalled();
      });

      test("allows selecting nothing", () => {
        mock_AppSettings.get.mockReturnValue("old-detector");

        emitter.emit(AppEvents.SETTINGS.SELECT_EXTENSION, fakeEvent, {
          type: "detector",
        });

        expect(mock_ExtensionManager.deactivate).toHaveBeenCalledWith(
          "old-detector"
        );
        expect(mock_ExtensionManager.activate).not.toHaveBeenCalled();
      });

      test("on apply prefix saves the new prefix", () => {
        emitter.emit(AppEvents.SETTINGS.APPLY_PREFIX, fakeEvent, "newPrefix");

        // saves new prefix and stores it in the listener
        expect(mock_AppSettings.save).toHaveBeenCalledWith(
          "prefix",
          "newPrefix"
        );
        expect(mock_ReplayDetectionListener.setPrefix).toHaveBeenCalledWith(
          "newPrefix"
        );
      });

      test("on select directory handles no results", async () => {
        mock_dialog.showOpenDialog.mockReturnValue({ filePaths: [] });
        let mock_sender = {
          send: jest.fn(),
          focus: jest.fn(),
        };
        emitter.emit(AppEvents.ACTIONS.SELECT_DIRECTORY, {
          sender: mock_sender,
        });
        // pretend something was selected
        await Promise.resolve();

        // displays dialog
        // sends result to caller
        expect(mock_dialog.showOpenDialog).toHaveBeenCalledWith(
          expect.anything(),
          {
            properties: ["openDirectory"],
          }
        );
        expect(mock_sender.send).toHaveBeenCalledWith(
          AppEvents.ACTIONS.SELECT_DIRECTORY_RESPONSE,
          null
        );
        expect(mock_sender.focus).toHaveBeenCalled();
      });
    });
  });
});
