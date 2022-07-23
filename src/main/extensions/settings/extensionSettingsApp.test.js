import { ipcMain } from "electron";
import { ExtensionSettingsDialog } from "./extensionSettingsDialog";

jest.mock("./extensionSettingsDialog", () => {
  return {
    ExtensionSettingsDialog: jest.fn().mockImplementation(() => {
      return {
        show: jest.fn(),
        destroy: jest.fn(),
      };
    }),
  };
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
  applyEdit: jest.fn(),
  getExtension: jest.fn(),
  getExtensionSettings: jest.fn(),
  edit: jest.fn(),
  cancelEdit: jest.fn(),
};

import ExtensionSettingsApp from "./extensionSettingsApp";
import { ExtensionEvents } from "../extensionEvents";

import { EventEmitter } from "events";
import path from "path";

describe("ExtensionSettingsApp", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("constructor registers events", () => {
    const esApp = new ExtensionSettingsApp(mockExtensionManager);

    expect(mock_ipcMain_on).toHaveBeenCalledWith(
      ExtensionEvents.EXTENSION_SETTINGS.EDIT,
      expect.any(Function)
    );
    expect(mock_ipcMain_on).toHaveBeenCalledWith(
      ExtensionEvents.EXTENSION_SETTINGS.CANCEL,
      expect.any(Function)
    );
    expect(mock_ipcMain_on).toHaveBeenCalledWith(
      ExtensionEvents.EXTENSION_SETTINGS.APPLY,
      expect.any(Function)
    );
  });

  test("Apply saves settings and closes dialog", () => {
    const emitter = new EventEmitter();
    mock_ipcMain_on.mockImplementation((event, cb) => emitter.on(event, cb));

    const esApp = new ExtensionSettingsApp(mockExtensionManager);

    const fakeDialog = {
      destroy: jest.fn(),
    };
    // pretend edit was called and a dialog is in context
    esApp.editingContext = "test-extension";
    esApp.extensionSettingsDialog = fakeDialog;

    emitter.emit(ExtensionEvents.EXTENSION_SETTINGS.APPLY, null, {
      settings: {
        field1: "value",
      },
    });

    // applies settings and closes dialog
    expect(mockExtensionManager.applyEdit).toHaveBeenCalledWith(
      "test-extension",
      { field1: "value" }
    );
    expect(fakeDialog.destroy).toHaveBeenCalled();
  });

  test("Cancel closes dialog", () => {
    const emitter = new EventEmitter();
    mock_ipcMain_on.mockImplementation((event, cb) => emitter.on(event, cb));

    const esApp = new ExtensionSettingsApp(mockExtensionManager);

    const fakeDialog = {
      destroy: jest.fn(),
    };
    // pretend edit was called and a dialog is in context
    esApp.editingContext = "test-extension";
    esApp.extensionSettingsDialog = fakeDialog;

    emitter.emit(ExtensionEvents.EXTENSION_SETTINGS.CANCEL);

    // closes dialog
    expect(fakeDialog.destroy).toHaveBeenCalled();
  });

  test("Edit does not display dialog when there are no view settings", () => {
    const emitter = new EventEmitter();
    mock_ipcMain_on.mockImplementation((event, cb) => emitter.on(event, cb));

    const esApp = new ExtensionSettingsApp(mockExtensionManager);
    // loaded extension
    mockExtensionManager.getExtension.mockReturnValue({
      configuration: {
        settings: {
          defaults: {
            foo: "bar",
          },
        },
      },
    });
    mockExtensionManager.getExtensionSettings.mockReturnValue({
      saved: true,
    });

    emitter.emit(ExtensionEvents.EXTENSION_SETTINGS.EDIT, null, {
      extensionName: "loadable",
    });

    expect(ExtensionSettingsDialog).not.toHaveBeenCalled();
    expect(mockExtensionManager.edit).not.toHaveBeenCalled();
  });

  test("Displays dialog when there is a view entry", () => {
    const emitter = new EventEmitter();
    mock_ipcMain_on.mockImplementation((event, cb) => emitter.on(event, cb));

    const esApp = new ExtensionSettingsApp(mockExtensionManager);
    const fakeWindow = {
      show: jest.fn(),
    };
    esApp.setMainWindow(fakeWindow);
    // loaded extension
    mockExtensionManager.getExtension.mockReturnValue({
      extensionPath: "fakePath",
      configuration: {
        settings: {
          defaults: {
            foo: "bar",
          },
          view: {
            entry: "index.html",
          },
        },
      },
    });
    mockExtensionManager.getExtensionSettings.mockReturnValue({
      saved: true,
    });

    emitter.emit(ExtensionEvents.EXTENSION_SETTINGS.EDIT, null, {
      extensionName: "loadable",
    });

    expect(ExtensionSettingsDialog).toHaveBeenCalledWith(
      {
        name: "loadable",
        displaySettings: {
          viewPath: path.join("fakePath", "index.html"),
        },
        settings: {
          saved: true,
        },
      },
      fakeWindow,
      expect.any(Function)
    );
    expect(mockExtensionManager.edit).toHaveBeenCalledWith("loadable");
  });

  test("Displays dialog with the desired dimension", () => {
    const emitter = new EventEmitter();
    mock_ipcMain_on.mockImplementation((event, cb) => emitter.on(event, cb));

    const esApp = new ExtensionSettingsApp(mockExtensionManager);
    const fakeWindow = {
      show: jest.fn(),
    };
    esApp.setMainWindow(fakeWindow);
    // loaded extension
    mockExtensionManager.getExtension.mockReturnValue({
      extensionPath: "fakePath",
      configuration: {
        settings: {
          defaults: {
            foo: "bar",
          },
          view: {
            entry: "index.html",
            width: 200,
            height: 200,
          },
        },
      },
    });
    mockExtensionManager.getExtensionSettings.mockReturnValue({
      saved: true,
    });

    emitter.emit(ExtensionEvents.EXTENSION_SETTINGS.EDIT, null, {
      extensionName: "loadable",
    });

    expect(ExtensionSettingsDialog).toHaveBeenCalledWith(
      {
        name: "loadable",
        displaySettings: {
          viewPath: path.join("fakePath", "index.html"),
          width: 200,
          height: 200,
        },
        settings: {
          saved: true,
        },
      },
      fakeWindow,
      expect.any(Function)
    );
  });

  test("extensionDialogClose cancels editing", () => {
    const esApp = new ExtensionSettingsApp(mockExtensionManager);

    const fakeDialog = {
      destroy: jest.fn(),
    };
    // pretend edit was called and a dialog is in context
    esApp.editingContext = "test-extension";
    esApp.extensionSettingsDialog = fakeDialog;

    esApp.extensionDialogClose();

    // closes dialog
    expect(mockExtensionManager.cancelEdit).toHaveBeenCalledWith(
      "test-extension"
    );
  });
});
