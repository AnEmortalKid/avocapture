let mock_loadExtension = jest.fn()

jest.mock('../loader/extensionLoader', () => {
  return jest.fn().mockImplementation(() => {
    return {
      loadExtension: (n) => mock_loadExtension(n)
    }
  });
});

let mock_installExtension = jest.fn()
import { installExtension } from "../installer/extensionInstaller"
jest.mock("../installer/extensionInstaller", () => {
  return (name) => mock_installExtension(name)
});

jest.mock("electron", () => {
  return {
    app: {
      getPath: jest.fn().mockReturnValue("fakeUserData"),
      getName: jest.fn(),
      getVersion: jest.fn()
    },
  };
});

jest.mock('fs');
const fs = require('fs');


let mock_extensionStore_clear = jest.fn()
import { ExtensionSettingsStore } from "../../settings/extensionSettings";
jest.mock('../../settings/extensionSettings', () => {
  return {
    ExtensionSettingsStore: jest.fn().mockImplementation(() => {
      return {
        clear: (k) => mock_extensionStore_clear(k)
      }
    })
  }
});

import ExtensionManager from './extensionManager'

const path = require('path');

describe("ExtensionManager", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  const testUploaderExtension = {
    extensionPath: path.join('fakeUserData', 'extensions', 'my-extension'),
    name: () => 'my-extension',
    type: () => 'uploader'
  };

  test("install installs extension", () => {
    const em = new ExtensionManager();
    em.install('my-extension')

    expect(mock_installExtension).toHaveBeenCalledWith('my-extension');
  });

  test("uninstall removes extension data for detector", () => {
    const em = new ExtensionManager();
    const extPath = path.join('fakeUserData', 'extensions', 'my-extension');
    // pretend extension was loaded
    em.extensions['my-extension'] = {
      extensionPath: extPath,
      name: () => 'my-extension',
      type: () => 'detector'
    }
    em.detectorNames.push({
      extensionName: 'my-extension', displayName: 'My Extension'
    });

    em.uninstall('my-extension')

    expect(fs.rmdirSync).toHaveBeenCalledWith(extPath, { force: true, recursive: true });
    expect(mock_extensionStore_clear).toHaveBeenCalledWith('my-extension');
    // should cleanup state
    expect(em.extensions).not.toHaveProperty('my-extension');
    expect(em.detectorNames).toEqual([]);
  });

  test("uninstall removes extension data for uploader", () => {
    const em = new ExtensionManager();
    const extPath = path.join('fakeUserData', 'extensions', 'my-extension');
    // pretend extension was loaded
    em.extensions['my-extension'] = testUploaderExtension
    em.uploaderNames.push({
      extensionName: 'my-extension', displayName: 'My Extension'
    });

    em.uninstall('my-extension')

    // should cleanup state
    expect(em.extensions).not.toHaveProperty('my-extension');
    expect(em.uploaderNames).toEqual([]);
  });

  test("uninstall calls registered listener", () => {
    let changeListener = jest.fn();

    const em = new ExtensionManager();
    em.registerChangeListener(changeListener);

    const extPath = path.join('fakeUserData', 'extensions', 'my-extension');
    // pretend extension was loaded
    em.extensions['my-extension'] = testUploaderExtension
    em.uploaderNames.push({
      extensionName: 'my-extension', displayName: 'My Extension'
    });

    em.uninstall('my-extension')

    expect(changeListener).toHaveBeenCalledWith({
      event: "uninstall",
      name: 'my-extension',
      type: 'uploader'
    });
  });

  test('uninstall deactivates extension', () => {
    const em = new ExtensionManager();

    const extPath = path.join('fakeUserData', 'extensions', 'my-extension');
    const callableExtension = {
      ...testUploaderExtension,
      instance: {
        teardown: jest.fn()
      }
    }
    // pretend extension was loaded
    em.extensions['my-extension'] = callableExtension
    em.uploaderNames.push({
      extensionName: 'my-extension', displayName: 'My Extension'
    });

    // mark active
    em.active.push('my-extension');

    em.uninstall('my-extension');

    // deactivates and updates state
    expect(callableExtension.instance.teardown).toHaveBeenCalled();
    expect(em.active).toEqual([]);
  });
})