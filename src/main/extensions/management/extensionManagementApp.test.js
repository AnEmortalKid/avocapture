import { BrowserWindow } from "electron";

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

let mock_webContents = {
  on: jest.fn(),
  send: jest.fn(),
};

let mock_ipcMain_on = jest.fn()
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
      };
    }),
    ipcMain: {
      on: (event, cb) => mock_ipcMain_on(event, cb)
    },
    app: {
      isPackaged: true,
      getName: jest.fn(),
      getVersion: jest.fn()
    }
  };
});

const mockExtensionManager = {
  getExtensionNames: jest.fn()
}

import ExtensionManagementApp from './extensionManagementApp'

describe("ExtensionManagementApp", () => {
  test("manage displays window", () => {
    const ema = new ExtensionManagementApp(mockExtensionManager);

    ema.manage({ show: jest.fn() });

    expect(mock_loadURL).toHaveBeenCalled();
  });
});