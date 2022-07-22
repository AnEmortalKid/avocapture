

// jest.mock('../../util/requireProvider', () => {
//   // Works and lets you check for constructor calls:
//   return {
//     requireProvider: jest.fn()
//   }
// }
// );

import { requireProvider } from "../../util/requireProvider";

import { BaseExtension } from '../extensionSchema'

let mock_require = jest.fn()
jest.mock('../../util/requireProvider', () => {
  return {
    requireProvider: jest.fn().mockImplementation(() => {
      return (p) => mock_require(p)
    })
  }
});


jest.mock("fs");
const fs = require('fs');


import ExtensionLoader from './extensionLoader'

const loadableExtensionJson = {
  name: 'loadable-extension',
  main: 'extension.js',
  version: '0.1.0',
  avocapture: {
    display: 'Loadable Extension',
    type: 'uploader',
    settings: {
      defaults: {}
    }
  }
}

// todo finish this
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
class NoExtensionMethod extends BaseExtension { }

describe("ExtensionLoader", () => {

  afterEach(() => {
    jest.clearAllMocks();
  })

  describe("loadExtension", () => {
    test("returns null when package.json is missing", () => {

    });

    describe("checkExtensionLoadable", () => {
      afterEach(() => {
        jest.clearAllMocks();
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
          el.loadExtension('foo');
        }

        const expected = [
          "initialize",
          "teardown",
          "notifyModifying",
          "notifyModifyApply",
          "notifyModifyCancel",
        ]
        expect(t).toThrow(Error);
        expect(t).toThrow("Extension loadable-extension did not declare functions: [" + expected + "]");
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
          el.loadExtension('foo');
        }

        const expected = [
          "initialize",
          "teardown",
          "notifyModifying",
          "notifyModifyApply",
          "notifyModifyCancel",
          "upload"
        ]
        expect(t).toThrow(Error);
        expect(t).toThrow("Extension loadable-extension did not declare functions: [" + expected + "]");
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
          el.loadExtension('foo');
        }

        expect(t).toThrow(Error);
        expect(t).toThrow("Extension loadable-extension did not declare functions: [upload]");
      });

      test("detects missing register method", () => {
        const t = () => {

          // pretend the path exists
          fs.existsSync.mockReturnValue(true);

          const detectorJson = {
            name: 'loadable-extension',
            main: 'extension.js',
            version: '0.1.0',
            avocapture: {
              display: 'Loadable Extension',
              type: 'detector',
              settings: {
                defaults: {}
              }
            }
          }

          mock_require
            // mock required json
            .mockReturnValueOnce(detectorJson)
            // mock required class
            .mockReturnValueOnce(NoExtensionMethod);
          const el = new ExtensionLoader();
          el.loadExtension('foo');
        }

        expect(t).toThrow(Error);
        expect(t).toThrow("Extension loadable-extension did not declare functions: [register]");
      });
    });
  });
});
