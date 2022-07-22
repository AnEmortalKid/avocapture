import { ipcMain } from "electron";
import { extensionSettingsDialog } from './extensionSettingsDialog'

jest.mock('./extensionSettingsDialog', () => {
  return {
    ExtensionSettingsDialog: jest.fn().mockImplementation(() => {
      return {
        show: jest.fn(),
        destroy: jest.fn()
      }
    })
  }
});

let mock_ipcMain_on = jest.fn();
jest.mock("electron", () => {
  return {
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
  applyEdit: jest.fn()
};

import ExtensionSettingsApp from './extensionSettingsApp'
import { ExtensionEvents } from "../extensionEvents";

import { EventEmitter } from 'events';

describe("ExtensionSettingsApp", () => {

  afterEach(() => {
    jest.clearAllMocks();
  })

  test("constructor registers events", () => {
    const esApp = new ExtensionSettingsApp(mockExtensionManager);

    expect(mock_ipcMain_on).toHaveBeenCalledWith(ExtensionEvents.EXTENSION_SETTINGS.EDIT, expect.any(Function));
    expect(mock_ipcMain_on).toHaveBeenCalledWith(ExtensionEvents.EXTENSION_SETTINGS.CANCEL, expect.any(Function));
    expect(mock_ipcMain_on).toHaveBeenCalledWith(ExtensionEvents.EXTENSION_SETTINGS.APPLY, expect.any(Function));
  });

  test("event does a thing", () => {
    const emitter = new EventEmitter();
    mock_ipcMain_on.mockImplementation((event, cb) => emitter.on(event, cb));

    const esApp = new ExtensionSettingsApp(mockExtensionManager);

    const fakeDialog = {
      destroy: jest.fn()
    }
    // pretend edit was called and a dialog is in contextS
    esApp.extensionSettingsDialog = fakeDialog;

    emitter.emit(ExtensionEvents.EXTENSION_SETTINGS.APPLY, null, {
      settings: {
        field1: 'value'
      }
    });

    // applies settings and closes dialog

    expect(fakeDialog.destroy).toHaveBeenCalled();
  });
})