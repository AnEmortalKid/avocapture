const mockZip = {
  readAsText: jest.fn(),
  extractAllTo: jest.fn(),
};

jest.mock("adm-zip", () => {
  // default export
  return jest.fn().mockImplementation(() => {
    return {
      readAsText: (n) => mockZip.readAsText(n),
      extractAllTo: (dest, ow) => mockZip.extractAllTo(dest, ow),
    };
  });
});

const fs = require("fs");
jest.mock("fs");

import { ZipInstaller } from "./zipInstaller";

describe("ZipInstaller", () => {
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
    mockZip.readAsText.mockReturnValue(
      JSON.stringify({
        name: "test-extension",
        version: "0.1.0",
      })
    );

    const zi = new ZipInstaller();
    const manifest = zi.getManifest("someZip.zip");

    expect(manifest.version).toBe("0.1.0");
    expect(mockZip.readAsText).toHaveBeenCalledWith("package.json");
  });

  test("installTo", () => {
    const zi = new ZipInstaller();

    zi.installTo("source.zip", "destination");

    expect(mockZip.extractAllTo).toHaveBeenCalledWith("destination", true);
  });
});
