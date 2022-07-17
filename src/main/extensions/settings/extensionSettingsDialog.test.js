import { BrowserWindow, app } from 'electron';

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
  send: jest.fn()
}
jest.mock('electron', () => {

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
        webContents: mock_webContents
      }
    }),
    app: {
      isPackaged: jest.fn().mockReturnValue(true)
    }
  }
});

import { ExtensionSettingsDialog } from './extensionSettingsDialog'
import { dialogBackgroundColor } from '../../util/styling.js'

describe("ExtensionSettingsDialog", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("creation displays dialog", () => {
    const esd = new ExtensionSettingsDialog({
      name: "fake",
      settings: {},
      displaySettings: {}
    },
      { fakeParentField: true },
      jest.fn()
    );

    mock_once.mockImplementation((event, cb) => {
      // fire ready-to-show
      cb();
    });

    expect(mock_setBackgroundColor).toHaveBeenCalledWith(dialogBackgroundColor);
    expect(mock_setAlwaysOnTop).toHaveBeenCalledWith(true, "screen-saver");
    expect(mock_setVisibleOnAllWorkspaces).toHaveBeenCalledWith(true);
    expect(mock_setFullScreenable).toHaveBeenCalledWith(false);
    expect(mock_loadURL).toHaveBeenCalledWith(path.resolve(__dirname, "views", "replay", "index.html"))

    // sets listeners
    expect(mock_once).toHaveBeenCalledWith("ready-to-show", expect.any(Function));
    expect(mock_on).toHaveBeenCalledWith("show", expect.any(Function));
  });
});

