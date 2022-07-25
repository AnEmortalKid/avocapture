const mockSet = jest.fn();
const mockDelete = jest.fn();
const mockGet = jest.fn();
const mockClear = jest.fn();

//do it like this since it is a default export
//and we can't reference a var
jest.mock("electron-store", () => {
  return jest.fn().mockImplementation(() => {
    return {
      set: (k, v) => mockSet(k, v),
      delete: (k) => mockDelete(k),
      get: (k, d) => mockGet(k, d),
      clear: () => mockClear(),
    };
  });
});

import { ExtensionSettingsStore } from "./extensionSettings";

describe("ExtensionSettingsStore", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("initialize creates a store for an extension", () => {
    const ess = new ExtensionSettingsStore();
    ess.initialize("testName");

    expect(ess.storesByExtensionName.keys()).toContain("testName");

    // this will be the mock ref
    const es = require("electron-store");
    expect(es).toHaveBeenCalledWith({ name: "testName", cwd: "settings" });
  });

  test("clear calls clear on the extension store", () => {
    const ess = new ExtensionSettingsStore();
    ess.initialize("testName");

    ess.clear("testName");
    expect(mockClear).toHaveBeenCalled();
  });

  test("get retrieves with empty defaults", () => {
    const ess = new ExtensionSettingsStore();
    ess.initialize("testName");

    ess.get("testName", "someKey");
    expect(mockGet.mock.calls[0]).toEqual(["defaults"]);
    expect(mockGet.mock.calls[1]).toEqual(["settings", {}]);
  });

  test("get retrieves with defaults", () => {
    const fakeDefaults = {
      fakeDefaultKey: "val",
    };
    mockGet.mockReturnValue(fakeDefaults);
    const ess = new ExtensionSettingsStore();
    ess.initialize("testName");

    ess.get("testName", "someKey");
    expect(mockGet.mock.calls[0]).toEqual(["defaults"]);
    expect(mockGet.mock.calls[1]).toEqual(["settings", fakeDefaults]);
  });

  test("save calls store for extension", () => {
    const ess = new ExtensionSettingsStore();
    ess.initialize("testName");

    ess.save("testName", { a: "b", c: "d" });

    expect(mockSet).toHaveBeenCalledWith("settings", { a: "b", c: "d" });
  });

  test("setDefaults updates extension defaults", () => {
    const ess = new ExtensionSettingsStore();
    ess.initialize("testName");

    const newDefaults = { newKey: "newVal" };

    ess.setDefaults("testName", newDefaults);

    expect(mockDelete).toHaveBeenCalledWith("defaults");
    expect(mockSet).toHaveBeenCalledWith("defaults", newDefaults);
  });
});
