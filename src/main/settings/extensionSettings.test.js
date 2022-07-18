const mockSet = jest.fn()
const mockDelete = jest.fn()
const mockGet = jest.fn()

//do it like this since it is a default export
//and we can't reference a var
jest.mock("electron-store", () => {
  return jest.fn().mockImplementation(() => {
    return {
      set: (k, v) => mockSet(k, v),
      delete: (k) => mockDelete(k),
      get: (k) => mockGet(k)
    };
  })
});

import { ExtensionSettingsStore } from './extensionSettings';

describe("ExtensionSettingsStore", () => {

  test("initialize creates a store for an extension", () => {
    const ess = new ExtensionSettingsStore();
    ess.initialize('testName');

    expect(ess.storesByExtensionName.keys()).toContain('testName')

    // this will be the mock ref
    const es = require('electron-store');
    expect(es).toHaveBeenCalledWith({ name: 'testName', cwd: "settings" })
  });


});
