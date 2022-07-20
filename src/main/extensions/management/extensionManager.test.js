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

import ExtensionManager from './extensionManager'

describe("ExtensionManager", () => {
  test("does it", () => {

    const em = new ExtensionManager();
    em.install('somePath')

    expect(mock_installExtension).toHaveBeenCalled();
  });
})