

// jest.mock('../../util/requireProvider', () => {
//   // Works and lets you check for constructor calls:
//   return {
//     requireProvider: jest.fn()
//   }
// }
// );

import { requireProvider } from "../../util/requireProvider";

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
class TestExtension {
  constructor(logger) {
    mock_constructor(logger);
  }

  initialize(s) {
    mock_initialize(s);
  }
}

describe("ExtensionLoader", () => {

  describe("loadExtension", () => {
    test("returns null when package.json is missing", () => {

    });


    test("checks extension is loadable", () => {
      // pretend the path exists
      fs.existsSync.mockReturnValue(true);

      // mock loaded json
      mock_require.mockReturnValueOnce(loadableExtensionJson)
        .mockReturnValueOnce(TestExtension);

      const el = new ExtensionLoader();
      el.loadExtension('foo');
    });
  });



});