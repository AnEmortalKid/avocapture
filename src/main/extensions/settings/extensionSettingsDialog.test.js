import { BrowserWindow, app } from "electron";

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
let mock_focus = jest.fn();

let mock_webContents = {
  on: jest.fn(),
  send: jest.fn(),
};
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
        removeMenu: mock_removeMenu,
        focus: mock_focus,
        webContents: mock_webContents,
      };
    }),
    app: {
      isPackaged: true,
    },
  };
});

const path = require("path");

import { ExtensionSettingsDialog } from "./extensionSettingsDialog";
import { dialogBackgroundColor } from "../../util/styling.js";
import { ExtensionEvents } from "../extensionEvents";
import { EventEmitter } from "events";

describe("ExtensionSettingsDialog", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("creation displays dialog", () => {
    const esd = new ExtensionSettingsDialog(
      {
        name: "fake",
        settings: {},
        displaySettings: {
          viewPath: "myViewPath",
        },
      },
      { fakeParentField: true },
      jest.fn()
    );

    mock_once.mockImplementation((event, cb) => {
      // fire ready-to-show
      cb();
    });

    expect(mock_setBackgroundColor).toHaveBeenCalledWith(dialogBackgroundColor);
    expect(mock_setFullScreenable).toHaveBeenCalledWith(false);
    expect(mock_loadURL).toHaveBeenCalledWith("myViewPath");

    // sets listeners
    expect(mock_once).toHaveBeenCalledWith(
      "ready-to-show",
      expect.any(Function)
    );
    expect(mock_on).toHaveBeenCalledWith("close", expect.any(Function));
  });

  test("show ready-to-show listener, invokes webcontents and displays", () => {
    const emitter = new EventEmitter();
    mock_once.mockImplementation((event, cb) => emitter.once(event, cb));

    const esd = new ExtensionSettingsDialog(
      {
        name: "fake",
        settings: {
          textcontent: "foo",
        },
        displaySettings: {
          viewPath: "myViewPath",
        },
      },
      { fakeParentField: true },
      jest.fn()
    );

    emitter.emit("ready-to-show");

    expect(mock_webContents.send).toHaveBeenCalledWith(
      ExtensionEvents.EXTENSION_SETTINGS.INITIALIZE,
      {
        textcontent: "foo",
      }
    );
    expect(mock_show).toHaveBeenCalled();
  });

  test("creation of dialog uses display settings", () => {
    let fakeParent = { fakeParentField: true };
    const esd = new ExtensionSettingsDialog(
      {
        name: "fake",
        settings: {
          textcontent: "foo",
        },
        displaySettings: {
          viewPath: "myViewPath",
          width: 300,
          height: 300,
        },
      },
      fakeParent,
      jest.fn()
    );

    const commonPreloadPath = path.resolve(
      __dirname,
      "extensions",
      "commonPreload.js"
    );

    expect(BrowserWindow).toHaveBeenCalledWith({
      width: 300,
      height: 300,
      frame: true,
      modal: true,
      titleBarOverlay: false,
      resizable: true,
      parent: fakeParent,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        preload: commonPreloadPath,
      },
    });
  });

  test("close event invokes callback", () => {
    const emitter = new EventEmitter();
    mock_on.mockImplementation((event, cb) => emitter.on(event, cb));

    let fakeCallback = jest.fn();

    const esd = new ExtensionSettingsDialog(
      {
        name: "fake",
        settings: {
          textcontent: "foo",
        },
        displaySettings: {
          viewPath: "myViewPath",
        },
      },
      { fakeParentField: true },
      fakeCallback
    );

    emitter.emit("close");

    expect(fakeCallback).toHaveBeenCalled();
  });

  test("destroy closes dialog", () => {
    const esd = new ExtensionSettingsDialog(
      {
        name: "fake",
        settings: {
          textcontent: "foo",
        },
        displaySettings: {
          viewPath: "myViewPath",
        },
      },
      { fakeParentField: true },
      jest.fn()
    );

    esd.destroy();

    expect(mock_close).toHaveBeenCalled();
  });

  test("focus focuses dialog", () => {
    const esd = new ExtensionSettingsDialog(
      {
        name: "fake",
        settings: {
          textcontent: "foo",
        },
        displaySettings: {
          viewPath: "myViewPath",
        },
      },
      { fakeParentField: true },
      jest.fn()
    );

    esd.focus();

    expect(mock_focus).toHaveBeenCalled();
  });
});
