const mockSet = jest.fn();
const mockDelete = jest.fn();
const mockGet = jest.fn();

import { Store } from "electron-store";

//do it like this since it is a default export
//and we can't reference a var
jest.mock("electron-store", () => {
  return jest.fn().mockImplementation(() => {
    return {
      set: (k, v) => mockSet(k, v),
      delete: (k) => mockDelete(k),
      get: (k) => mockGet(k),
      store: {},
    };
  });
});

import { AppSettings } from "./appSettings";

describe("AppSettings", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("creates app store with correct config", () => {
    // this will be the mock
    const es = require("electron-store");
    expect(es).toHaveBeenCalledWith({
      name: "avocapture",
      cwd: "settings",
      clearInvalidConfig: true,
    });
  });

  test("save stores key when provided with data", () => {
    const appSettings = new AppSettings();

    appSettings.save("someKey", "valueObj");

    expect(mockSet).toHaveBeenCalledWith("someKey", "valueObj");
  });

  test("save deletes key when not given data", () => {
    const appSettings = new AppSettings();

    appSettings.save("someKey");

    expect(mockDelete).toHaveBeenCalledWith("someKey");
  });

  test("get retrieves value", () => {
    const appSettings = new AppSettings();

    appSettings.get("someKey");

    expect(mockGet).toHaveBeenCalledWith("someKey");
  });

  test("clear deletes key", () => {
    const appSettings = new AppSettings();

    appSettings.clear("someKey");

    expect(mockDelete).toHaveBeenCalledWith("someKey");
  });

  test("getAll  returns defaults when no keys", () => {
    const appSettings = new AppSettings();
    const all = appSettings.getAll();

    expect(all).toEqual({
      prefix: "Prefix",
    });
  });
});
