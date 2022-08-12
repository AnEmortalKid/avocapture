const mockZip = {
  on: jest.fn(),
  extract: jest.fn(),
  close: jest.fn(),
  entryDataSync: jest.fn(),
};

jest.mock("node-stream-zip", () => {
  // default export
  return jest.fn().mockImplementation(() => {
    return {
      on: (event, cb) => mockZip.on(event, cb),
      extract: (entry, name, cb) => mockZip.extract(entry, name, cb),
      close: () => mockZip.close(),
      entryDataSync: (entry) => mockZip.entryDataSync(entry),
    };
  });
});

const fs = require("fs");
jest.mock("fs");

import { ZipInstaller } from "./ZipInstaller";
import { EventEmitter } from "events";

let emitter;

describe("ZipInstaller", () => {
  beforeEach(() => {
    emitter = new EventEmitter();
    mockZip.on.mockImplementation((n, c) => emitter.on(n, c));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("supportsInstalling", () => {
    test("does not handle directories", () => {
      fs.lstatSync.mockReturnValue({
        isDirectory: () => true,
      });

      const zi = new ZipInstaller();
      expect(zi.supportsInstalling("someDir")).toBeFalsy();
    });

    test("checks file extension", () => {
      fs.lstatSync.mockReturnValue({
        isDirectory: () => false,
      });

      const zi = new ZipInstaller();
      expect(zi.supportsInstalling("someFile")).toBeFalsy();
    });

    test("supports zips", () => {
      fs.lstatSync.mockReturnValue({
        isDirectory: () => false,
      });

      const zi = new ZipInstaller();
      expect(zi.supportsInstalling("someZip.zip")).toBeTruthy();
    });
  });

  test("getManifest", () => {
    mockZip.entryDataSync.mockReturnValue(
      JSON.stringify({
        name: "test-extension",
        version: "0.1.0",
      })
    );

    const zi = new ZipInstaller();
    const manifest = zi.getManifest("someZip.zip");

    expect(mockZip.on).toHaveBeenCalledWith("ready", expect.any(Function));

    // pretend ready fires
    emitter.emit("ready");

    expect(mockZip.entryDataSync).toHaveBeenCalledWith("package.json");
    expect(mockZip.close).toHaveBeenCalled();
  });

  test("installTo", () => {
    mockZip.extract.mockImplementation((e, d, callback) => {
      callback();
    });

    const zi = new ZipInstaller();

    zi.installTo("source.zip", "destination");

    // sets up listeners on our events
    expect(mockZip.on).toHaveBeenCalledWith("extract", expect.any(Function));
    expect(mockZip.on).toHaveBeenCalledWith("ready", expect.any(Function));

    // pretend ready fires
    emitter.emit("ready");

    expect(mockZip.extract).toHaveBeenCalledWith(
      null,
      "destination",
      expect.any(Function)
    );
    expect(mockZip.close).toHaveBeenCalled();
  });
});
