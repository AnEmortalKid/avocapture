import { requireProvider } from "../../util/requireProvider";

import { BaseExtension } from "../extensionSchema";

let mock_require = jest.fn();
jest.mock("../../util/requireProvider", () => {
  return {
    requireProvider: jest.fn().mockImplementation(() => {
      return (p) => mock_require(p);
    }),
  };
});

jest.mock("fs");
const fs = require("fs");

import ExtensionLoader from "./extensionLoader";

const loadableExtensionJson = {
  name: "loadable-extension",
  description: "A loadable extension",
  main: "extension.js",
  version: "0.1.0",
  avocapture: {
    display: "Loadable Extension",
    type: "uploader",
    settings: {
      defaults: {},
    },
  },
};

let mock_constructor = jest.fn();
let mock_initialize = jest.fn();
let mock_teardown = jest.fn();
let mock_notifyModifying = jest.fn();
let mock_notifyApply = jest.fn();
let mock_notifyCancel = jest.fn();
let mock_register = jest.fn();
let mock_upload = jest.fn();
class TestUploaderDetectorExtension {
  constructor(logger) {
    mock_constructor(logger);
  }

  initialize(s) {
    mock_initialize(s);
  }

  teardown() {
    mock_teardown();
  }

  /**
   * The extension's settings are in the process of being modified
   */
  notifyModifying() {
    mock_notifyModifying();
  }

  /**
   * The extension has new settings
   *
   * @param {*} newSettings the new settings
   */
  notifyModifyApply(newSettings) {
    mock_notifyApply(newSettings);
  }

  /**
   * The extension's settings were not changed.
   */
  notifyModifyCancel() {
    mock_notifyCancel();
  }

  register(listener) {
    mock_register(listener);
  }

  upload(replayData) {
    mock_upload(replayData);
  }
}

// all methods missing
class NotAnExtension {
  constructor() {
    // nothing
  }
}

class NoBaseMethods {
  constructor() {
    // nothing
  }
  register(listener) {
    throw new Error("Unimplemented");
  }
  upload(replayData) {
    throw new Error("Unimplemented");
  }
}

// misses the extension specific method
class NoExtensionMethod extends BaseExtension {}

describe("ExtensionLoader", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("loadExtension", () => {
    test("returns null when package.json is missing", () => {
      fs.existsSync.mockReturnValue(false);

      const el = new ExtensionLoader();
      expect(el.loadExtension("loadable-extension")).toBeNull();
    });

    describe("checkExtensionLoadable", () => {
      afterEach(() => {
        jest.clearAllMocks();
      });

      test("detects top level missing json props", () => {
        const t = () => {
          // pretend the path exists
          fs.existsSync.mockReturnValue(true);

          mock_require
            // mock required json
            .mockReturnValueOnce({
              description: "a fake package json",
            });
          const el = new ExtensionLoader();
          el.loadExtension("foo");
        };

        const expected = ["name", "main", "version"];
        expect(t).toThrow(Error);
        expect(t).toThrow("package.json object is missing [" + expected + "]");
      });

      test("detects missing avocapture property", () => {
        const t = () => {
          // pretend the path exists
          fs.existsSync.mockReturnValue(true);

          mock_require
            // mock required json
            .mockReturnValueOnce({
              name: "test-ext",
              version: "1.0.0",
              main: "index.js",
            });
          const el = new ExtensionLoader();
          el.loadExtension("foo");
        };

        const expected = ["name", "main", "version"];
        expect(t).toThrow(Error);
        expect(t).toThrow("avocapture object not defined in package.json");
      });

      test("detects missing avocapture properties", () => {
        const t = () => {
          // pretend the path exists
          fs.existsSync.mockReturnValue(true);

          mock_require
            // mock required json
            .mockReturnValueOnce({
              name: "test-ext",
              version: "1.0.0",
              main: "index.js",
              avocapture: {},
            });
          const el = new ExtensionLoader();
          el.loadExtension("foo");
        };

        const expected = ["display", "type", "settings"];
        expect(t).toThrow(Error);
        expect(t).toThrow("Avocapture object is missing [" + expected + "]");
      });

      test("detects missing base methods", () => {
        const t = () => {
          // pretend the path exists
          fs.existsSync.mockReturnValue(true);

          mock_require
            // mock required json
            .mockReturnValueOnce(loadableExtensionJson)
            // mock required class
            .mockReturnValueOnce(NoBaseMethods);

          const el = new ExtensionLoader();
          el.loadExtension("foo");
        };

        const expected = [
          "initialize",
          "teardown",
          "notifyModifying",
          "notifyModifyApply",
          "notifyModifyCancel",
        ];
        expect(t).toThrow(Error);
        expect(t).toThrow(
          "Extension loadable-extension did not declare functions: [" +
            expected +
            "]"
        );
      });

      test("detects all missing methods", () => {
        const t = () => {
          // pretend the path exists
          fs.existsSync.mockReturnValue(true);

          mock_require
            // mock required json
            .mockReturnValueOnce(loadableExtensionJson)
            // mock required class
            .mockReturnValueOnce(NotAnExtension);

          const el = new ExtensionLoader();
          el.loadExtension("foo");
        };

        const expected = [
          "initialize",
          "teardown",
          "notifyModifying",
          "notifyModifyApply",
          "notifyModifyCancel",
          "upload",
        ];
        expect(t).toThrow(Error);
        expect(t).toThrow(
          "Extension loadable-extension did not declare functions: [" +
            expected +
            "]"
        );
      });

      test("detects missing upload method", () => {
        const t = () => {
          // pretend the path exists
          fs.existsSync.mockReturnValue(true);

          mock_require
            // mock required json
            .mockReturnValueOnce(loadableExtensionJson)
            // mock required class
            .mockReturnValueOnce(NoExtensionMethod);
          const el = new ExtensionLoader();
          el.loadExtension("foo");
        };

        expect(t).toThrow(Error);
        expect(t).toThrow(
          "Extension loadable-extension did not declare functions: [upload]"
        );
      });

      test("detects missing register method", () => {
        const t = () => {
          // pretend the path exists
          fs.existsSync.mockReturnValue(true);

          const detectorJson = {
            name: "loadable-extension",
            main: "extension.js",
            version: "0.1.0",
            avocapture: {
              display: "Loadable Extension",
              type: "detector",
              settings: {
                defaults: {},
              },
            },
          };

          mock_require
            // mock required json
            .mockReturnValueOnce(detectorJson)
            // mock required class
            .mockReturnValueOnce(NoExtensionMethod);
          const el = new ExtensionLoader();
          el.loadExtension("foo");
        };

        expect(t).toThrow(Error);
        expect(t).toThrow(
          "Extension loadable-extension did not declare functions: [register]"
        );
      });
    });

    test("loadExtension returns LoadedExtension", () => {
      // pretend it exists
      fs.existsSync.mockReturnValue(true);

      mock_require
        // mock required json
        .mockReturnValueOnce(loadableExtensionJson)
        // mock required class
        .mockReturnValueOnce(TestUploaderDetectorExtension);

      const el = new ExtensionLoader();
      const loaded = el.loadExtension("loadable-extension");

      expect(loaded.instance).not.toBeNull();
      expect(loaded.configuration).toEqual({
        name: "loadable-extension",
        description: "A loadable extension",
        display: "Loadable Extension",
        type: "uploader",
        settings: {
          defaults: {},
        },
      });
    });

    test("loadExtensions loads extensions in directory", () => {
      fs.readdirSync.mockReturnValue([
        {
          isDirectory: () => true,
          name: "first-extension",
        },
        {
          isDirectory: () => true,
          name: "second-extension",
        },
        {
          isDirectory: () => false,
          name: "some-file",
        },
        {
          isDirectory: () => true,
          name: "not-an-extension-file",
        },
      ]);

      // pretend the first two exist and third does not have a json
      fs.existsSync
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValue(false);

      const detectorJson = {
        name: "loadable-extension",
        main: "extension.js",
        version: "0.1.0",
        avocapture: {
          display: "Loadable Extension",
          type: "detector",
          settings: {
            defaults: {},
          },
        },
      };
      mock_require
        // mock first extension
        .mockReturnValueOnce(loadableExtensionJson)
        .mockReturnValueOnce(TestUploaderDetectorExtension)
        // second extension
        .mockReturnValueOnce(detectorJson)
        .mockReturnValueOnce(TestUploaderDetectorExtension);

      const el = new ExtensionLoader();
      const loaded = el.loadExtensions("dirWithMyExtensions");
      expect(loaded.length).toBe(2);
    });
  });
});
