let mock_loadExtension = jest.fn();
let mock_loadExtensions = jest.fn();

jest.mock("../loader/extensionLoader", () => {
  return jest.fn().mockImplementation(() => {
    return {
      loadExtension: (n) => mock_loadExtension(n),
      loadExtensions: (dirPath) => mock_loadExtensions(dirPath),
    };
  });
});

let mock_installExtension = jest.fn();
import { installExtension } from "../installer/extensionInstaller";
jest.mock("../installer/extensionInstaller", () => {
  return (name) => mock_installExtension(name);
});

jest.mock("electron", () => {
  return {
    app: {
      getPath: jest.fn().mockReturnValue("fakeUserData"),
      getName: jest.fn(),
      getVersion: jest.fn(),
    },
  };
});

jest.mock("fs");
const fs = require("fs");

let mock_extensionStore_clear = jest.fn();
let mock_extensionStore_save = jest.fn();
let mock_extensionStore_initialize = jest.fn();
let mock_extensionStore_setDefaults = jest.fn();
let mock_extensionStore_get = jest.fn();
import { ExtensionSettingsStore } from "../../settings/extensionSettings";
jest.mock("../../settings/extensionSettings", () => {
  return {
    ExtensionSettingsStore: jest.fn().mockImplementation(() => {
      return {
        clear: (k) => mock_extensionStore_clear(k),
        initialize: (k) => mock_extensionStore_initialize(k),
        setDefaults: (k, d) => mock_extensionStore_setDefaults(k, d),
        get: (k) => mock_extensionStore_get(k),
        save: (k, d) => mock_extensionStore_save(k, d),
      };
    }),
  };
});

import ExtensionManager from "./extensionManager";
import { get } from "http";

const path = require("path");

describe("ExtensionManager", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const testUploaderExtension = {
    extensionPath: path.join("fakeUserData", "extensions", "my-extension"),
    name: () => "my-extension",
    type: () => "uploader",
    instance: {
      teardown: jest.fn(),
      initialize: jest.fn(),
      notifyModifying: jest.fn(),
      notifyModifyApply: jest.fn(),
      notifyModifyCancel: jest.fn(),
    },
  };

  test("install installs extension", () => {
    const em = new ExtensionManager();
    em.install("my-extension");

    expect(mock_installExtension).toHaveBeenCalledWith("my-extension");
  });

  test("uninstall removes extension data for detector", () => {
    const em = new ExtensionManager();
    const extPath = path.join("fakeUserData", "extensions", "my-extension");
    // pretend extension was loaded
    em.extensions["my-extension"] = {
      extensionPath: extPath,
      name: () => "my-extension",
      type: () => "detector",
    };
    em.detectorNames.push({
      extensionName: "my-extension",
      displayName: "My Extension",
    });

    em.uninstall("my-extension");

    expect(fs.rmdirSync).toHaveBeenCalledWith(extPath, {
      force: true,
      recursive: true,
    });
    expect(mock_extensionStore_clear).toHaveBeenCalledWith("my-extension");
    // should cleanup state
    expect(em.extensions).not.toHaveProperty("my-extension");
    expect(em.detectorNames).toEqual([]);
  });

  test("uninstall removes extension data for uploader", () => {
    const em = new ExtensionManager();
    // pretend extension was loaded
    em.extensions["my-extension"] = testUploaderExtension;
    em.uploaderNames.push({
      extensionName: "my-extension",
      displayName: "My Extension",
    });

    em.uninstall("my-extension");

    // should cleanup state
    expect(em.extensions).not.toHaveProperty("my-extension");
    expect(em.uploaderNames).toEqual([]);
  });

  test("uninstall calls registered listener", () => {
    let changeListener = jest.fn();

    const em = new ExtensionManager();
    em.registerChangeListener(changeListener);

    const extPath = path.join("fakeUserData", "extensions", "my-extension");
    // pretend extension was loaded
    em.extensions["my-extension"] = testUploaderExtension;
    em.uploaderNames.push({
      extensionName: "my-extension",
      displayName: "My Extension",
    });

    em.uninstall("my-extension");

    expect(changeListener).toHaveBeenCalledWith({
      event: "uninstall",
      name: "my-extension",
      type: "uploader",
    });
  });

  test("uninstall deactivates extension", () => {
    const em = new ExtensionManager();

    // pretend extension was loaded
    em.extensions["my-extension"] = testUploaderExtension;
    em.uploaderNames.push({
      extensionName: "my-extension",
      displayName: "My Extension",
    });

    // mark active
    em.active.push("my-extension");

    em.uninstall("my-extension");

    // deactivates and updates state
    expect(testUploaderExtension.instance.teardown).toHaveBeenCalled();
    expect(em.active).toEqual([]);
  });

  test("loadInstalled loads extensions on disk", () => {
    mock_loadExtensions.mockReturnValue(
      // fake extension
      [
        {
          instance: jest.fn(),
          configuration: {
            settings: {
              defaults: {
                foo: "bar",
              },
            },
          },
          name: () => "loaded-extension",
          type: () => "detector",
          display: () => "Loaded Extension",
        },
      ]
    );

    const em = new ExtensionManager();
    em.loadInstalled();

    expect(mock_loadExtensions).toHaveBeenCalledWith(
      path.join("fakeUserData", "extensions")
    );
    expect(mock_extensionStore_initialize).toHaveBeenCalledWith(
      "loaded-extension"
    );
    expect(mock_extensionStore_setDefaults).toHaveBeenCalledWith(
      "loaded-extension",
      { foo: "bar" }
    );
  });

  test("loadExternal loads previously installed", () => {
    mock_loadExtension.mockReturnValue(
      // fake extension
      {
        instance: jest.fn(),
        configuration: {
          settings: {
            defaults: {
              foo: "bar",
            },
          },
        },
        name: () => "loaded-extension",
        type: () => "detector",
        display: () => "Loaded Extension",
      }
    );
    let changeListener = jest.fn();

    const em = new ExtensionManager();
    em.registerChangeListener(changeListener);
    em.loadExternal("loaded-extension");

    expect(mock_loadExtension).toHaveBeenCalledWith(
      path.join("fakeUserData", "extensions", "loaded-extension")
    );
    expect(mock_extensionStore_initialize).toHaveBeenCalledWith(
      "loaded-extension"
    );
    expect(mock_extensionStore_setDefaults).toHaveBeenCalledWith(
      "loaded-extension",
      { foo: "bar" }
    );

    expect(changeListener).toHaveBeenCalledWith({
      event: "loadExternal",
      name: "loaded-extension",
    });
  });

  describe("getExtension methods", () => {
    const mockLoadedUploader = {
      instance: jest.fn(),
      configuration: {
        settings: {
          defaults: {
            foo: "bar",
          },
        },
      },
      name: () => "loaded-uploader",
      type: () => "uploader",
      display: () => "Loaded Uploader",
    };
    mock_loadExtension
      .mockReturnValueOnce(
        // fake extension
        {
          instance: jest.fn(),
          configuration: {
            settings: {
              defaults: {
                foo: "bar",
              },
            },
          },
          name: () => "loaded-detector",
          type: () => "detector",
          display: () => "Loaded Detector",
        }
      )
      .mockReturnValueOnce(mockLoadedUploader);

    const em = new ExtensionManager();
    em.loadExternal("loaded-detector");
    em.loadExternal("loaded-uploader");

    test("getExtensionsOfType returns loaded detectors", () => {
      expect(em.getExtensionsOfType("detector")).toEqual([
        {
          extensionName: "loaded-detector",
          displayName: "Loaded Detector",
        },
      ]);
    });

    test("getExtensionsOfType returns loaded uploaders", () => {
      expect(em.getExtensionsOfType("uploader")).toEqual([
        {
          extensionName: "loaded-uploader",
          displayName: "Loaded Uploader",
        },
      ]);
    });

    test("getExtensionsOfType throws error on unsupported", () => {
      const t = () => {
        em.getExtensionsOfType("fake");
      };

      expect(t).toThrow(Error);
      expect(t).toThrow("Unsupported type fake");
    });

    test("getExtensionNames", () => {
      expect(em.getExtensionNames()).toEqual([
        "loaded-detector",
        "loaded-uploader",
      ]);
    });

    test("getExtension", () => {
      expect(em.getExtension("loaded-uploader")).toEqual(mockLoadedUploader);
    });

    test("getExtensionSettings", () => {
      em.getExtensionSettings("loaded-uploader");

      expect(mock_extensionStore_get).toHaveBeenCalledWith("loaded-uploader");
    });
  });

  describe("Extension lifecycle methods", () => {
    let em;

    beforeEach(() => {
      jest.clearAllMocks();
      em = new ExtensionManager();
      // pretend extension was loaded
      em.extensions["my-extension"] = testUploaderExtension;
      em.uploaderNames.push({
        extensionName: "my-extension",
        displayName: "My Extension",
      });
    });

    test("activate activates extension with its settings", () => {
      mock_extensionStore_get.mockReturnValue({ foo: "bar" });
      em.activate("my-extension");

      // retrieves its settings
      expect(mock_extensionStore_get).toHaveBeenCalledWith("my-extension");
      expect(testUploaderExtension.instance.initialize).toHaveBeenCalledWith({
        foo: "bar",
      });
      expect(em.active).toEqual(["my-extension"]);
    });

    test("deactivate tears down extension", () => {
      em.active.push("my-extension");

      em.deactivate("my-extension");

      expect(testUploaderExtension.instance.teardown).toHaveBeenCalled();
      expect(em.active).toEqual([]);
    });

    test("shutdown deactivates all active extensions", () => {
      em.active.push("my-extension");

      em.shutdown();

      expect(testUploaderExtension.instance.teardown).toHaveBeenCalled();
      expect(em.active).toEqual([]);
    });

    test("edit notifiesModifying", () => {
      em.edit("my-extension");

      expect(testUploaderExtension.instance.notifyModifying).toHaveBeenCalled();
    });

    test("applyEdit calls modifyApply and saves state", () => {
      em.applyEdit("my-extension", { updated: true });

      expect(mock_extensionStore_save).toHaveBeenCalledWith("my-extension", {
        updated: true,
      });
      expect(
        testUploaderExtension.instance.notifyModifyApply
      ).toHaveBeenCalledWith({ updated: true });
    });

    test("cancelEdit calls modify cancel", () => {
      em.cancelEdit("my-extension");

      expect(
        testUploaderExtension.instance.notifyModifyCancel
      ).toHaveBeenCalled();
    });
  });
});
