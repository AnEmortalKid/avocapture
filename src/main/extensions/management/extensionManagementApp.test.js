import { BrowserWindow } from "electron";
import { dialogBackgroundColor } from "../../util/styling";
import { ExtensionEvents } from "../extensionEvents";

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
let mock_removeMenu = jest.fn();

let mock_webContents = {
  on: jest.fn(),
  send: jest.fn(),
};

let mock_ipcMain_on = jest.fn();
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
        webContents: mock_webContents,
        removeMenu: mock_removeMenu,
      };
    }),
    ipcMain: {
      on: (event, cb) => mock_ipcMain_on(event, cb),
    },
    app: {
      isPackaged: true,
      getName: jest.fn(),
      getVersion: jest.fn(),
    },
  };
});

const mockExtensionManager = {
  getExtensionNames: jest.fn(),
  registerChangeListener: jest.fn(),
  getExtension: jest.fn(),
  install: jest.fn(),
  loadExternal: jest.fn(),
  uninstall: jest.fn(),
};

import { isProduction } from "../../util/processInfo";
jest.mock("../../util/processInfo");

import ExtensionManagementApp from "./extensionManagementApp";

import { EventEmitter } from "events";

const path = require("path");

const fakeParent = { modal: false };

function setupMockExtensionData() {
  mockExtensionManager.getExtensionNames.mockReturnValue(["my-extension"]);
  mockExtensionManager.getExtension.mockReturnValue({
    display: () => "extension display",
    description: () => "extension description",
    isBuiltIn: () => false,
  });
}

describe("ExtensionManagementApp", () => {
  beforeEach(() => {
    isProduction.mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("initialization sets listeners", () => {
    const ema = new ExtensionManagementApp(mockExtensionManager);

    expect(mock_ipcMain_on).toHaveBeenCalledWith(
      ExtensionEvents.EXTENSION_MANAGEMENT.INSTALL,
      expect.any(Function)
    );
    expect(mock_ipcMain_on).toHaveBeenCalledWith(
      ExtensionEvents.EXTENSION_MANAGEMENT.UNINSTALL,
      expect.any(Function)
    );
    expect(mock_ipcMain_on).toHaveBeenCalledWith(
      ExtensionEvents.EXTENSION_MANAGEMENT.CLOSE,
      expect.any(Function)
    );
  });
  test("manage displays window", () => {
    const ema = new ExtensionManagementApp(mockExtensionManager);
    ema.manage(fakeParent);

    expect(BrowserWindow).toHaveBeenCalledWith({
      width: 450,
      height: 450,
      frame: true,
      modal: true,
      titleBarOverlay: false,
      resizable: true,
      parent: fakeParent,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        sandbox: false,
      },
    });

    expect(mock_loadURL).toHaveBeenCalledWith(
      path.resolve(__dirname, "views", "extensions", "management.html")
    );
    expect(mock_setBackgroundColor).toHaveBeenCalledWith(dialogBackgroundColor);
    expect(mock_setFullScreenable).toHaveBeenCalledWith(false);
    expect(mock_removeMenu).toHaveBeenCalled();
    expect(mock_once).toHaveBeenCalledWith(
      "ready-to-show",
      expect.any(Function)
    );
  });

  test("keeps menu when not in production mode", () => {
    isProduction.mockReturnValue(false);

    const ema = new ExtensionManagementApp(mockExtensionManager);
    ema.manage(fakeParent);

    expect(mock_removeMenu).not.toHaveBeenCalled();
  });

  test("ready-to-show sends extension data to dialog", () => {
    const emitter = new EventEmitter();
    mock_once.mockImplementation((event, cb) => emitter.once(event, cb));

    setupMockExtensionData();

    const ema = new ExtensionManagementApp(mockExtensionManager);
    ema.manage(fakeParent);
    emitter.emit("ready-to-show");

    expect(mock_webContents.send).toHaveBeenCalledWith(
      ExtensionEvents.EXTENSION_MANAGEMENT.INITIALIZE,
      [
        {
          name: "my-extension",
          display: "extension display",
          description: "extension description",
          isBuiltIn: false,
        },
      ]
    );
    expect(mock_show).toHaveBeenCalled();
  });

  describe("handled events", () => {
    const emitter = new EventEmitter();

    beforeEach(() => {
      mock_ipcMain_on.mockImplementation((event, cb) => emitter.on(event, cb));
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test("INSTALL event installs extension and reloads application", () => {
      // install returns the name
      mockExtensionManager.install.mockReturnValue("my-extension");
      mockExtensionManager.loadExternal.mockImplementation(() => {
        // load the data only when called
        setupMockExtensionData();
      });

      const ema = new ExtensionManagementApp(mockExtensionManager);
      ema.manage(fakeParent);
      emitter.emit(
        ExtensionEvents.EXTENSION_MANAGEMENT.INSTALL,
        { fakeEvent: true },
        ["installPath"]
      );

      expect(mockExtensionManager.install).toHaveBeenCalledWith("installPath");
      expect(mockExtensionManager.loadExternal).toHaveBeenCalledWith(
        "my-extension"
      );
      // loads the updated data
      expect(mock_webContents.send).toHaveBeenCalledWith(
        ExtensionEvents.EXTENSION_MANAGEMENT.INITIALIZE,
        [
          {
            name: "my-extension",
            display: "extension display",
            description: "extension description",
            isBuiltIn: false,
          },
        ]
      );
    });

    test("UNINSTALl uninstall extension and reloads app", () => {
      mockExtensionManager.uninstall.mockImplementation(() => {
        // fake update the installed extensions
        setupMockExtensionData();
      });

      const ema = new ExtensionManagementApp(mockExtensionManager);
      ema.manage(fakeParent);
      emitter.emit(
        ExtensionEvents.EXTENSION_MANAGEMENT.UNINSTALL,
        { fakeEvent: true },
        "uninstallable-extension"
      );

      expect(mockExtensionManager.uninstall).toHaveBeenCalledWith(
        "uninstallable-extension"
      );
      // loads the up to date data
      expect(mock_webContents.send).toHaveBeenCalledWith(
        ExtensionEvents.EXTENSION_MANAGEMENT.INITIALIZE,
        [
          {
            name: "my-extension",
            display: "extension display",
            description: "extension description",
            isBuiltIn: false,
          },
        ]
      );
    });

    test("Close events closes the application", () => {
      const ema = new ExtensionManagementApp(mockExtensionManager);
      ema.manage(fakeParent);
      emitter.emit(ExtensionEvents.EXTENSION_MANAGEMENT.CLOSE, {
        fakeEvent: true,
      });

      expect(mock_close).toHaveBeenCalled();
    });
  });
});
