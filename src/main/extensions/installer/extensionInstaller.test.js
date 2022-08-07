jest.mock("./copyUtils");

jest.mock("fs");
const fs = require("fs");

jest.mock("child_process");

jest.mock("electron", () => {
  return {
    app: {
      getPath: jest.fn().mockReturnValue("fakeUserData"),
      getName: jest.fn().mockReturnValue("avocapture"),
      getVersion: jest.fn().mockReturnValue("0.3.0"),
    },
  };
});

jest.mock("./installers");
import { getInstallers } from "./installers";

import { copyAssets } from "./copyUtils";

import installExtension from "./extensionInstaller";

const path = require("path");

const mockInstaller = {
  getManifest: jest.fn(),
  installTo: jest.fn(),
  supportsInstalling: jest.fn(),
};

const mockInstaller2 = {
  getManifest: jest.fn(),
  installTo: jest.fn(),
  supportsInstalling: jest.fn(),
};

describe("extensionInstaller", () => {
  const env = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...env };
  });

  afterEach(() => {
    process.env = env;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("supported installer", () => {
    beforeEach(() => {
      getInstallers.mockReturnValue([mockInstaller]);
      mockInstaller.supportsInstalling.mockReturnValue(true);
    });

    test("installs net new extension", () => {
      mockInstaller.getManifest.mockReturnValue({
        name: "test-extension",
        version: "0.1.0",
      });
      installExtension("test-extension");

      const extensionInstallDir = path.join(
        "fakeUserData",
        "extensions",
        "test-extension"
      );

      expect(fs.mkdirSync).toHaveBeenCalledWith(extensionInstallDir, {
        recursive: true,
      });
      expect(mockInstaller.installTo).toHaveBeenCalledWith(
        "test-extension",
        extensionInstallDir
      );
      expect(copyAssets).toHaveBeenCalledWith(extensionInstallDir);
    });

    test("installs new version of an extension", () => {
      // pretend the install destination exists
      fs.existsSync.mockReturnValue(true);

      mockInstaller.getManifest.mockReturnValue({
        name: "test-extension",
        version: "0.2.0",
      });

      // old install
      fs.readFileSync.mockReturnValueOnce(
        JSON.stringify({
          name: "test-extension",
          version: "0.1.0",
        })
      );

      installExtension("test-extension");

      expect(mockInstaller.installTo).toHaveBeenCalled();
      expect(copyAssets).toHaveBeenCalled();
    });

    test("does not install older extension", () => {
      // pretend the install destination exists
      fs.existsSync.mockReturnValue(true);

      mockInstaller.getManifest.mockReturnValue({
        name: "test-extension",
        version: "0.1.0",
      });

      // old install
      fs.readFileSync.mockReturnValueOnce(
        JSON.stringify({
          name: "test-extension",
          version: "0.2.0",
        })
      );

      installExtension("test-extension");

      expect(mockInstaller.installTo).not.toHaveBeenCalled();
      expect(copyAssets).not.toHaveBeenCalled();
    });

    test("overwrites when avocaptureDebug", () => {
      process.env.AVOCAPTURE_DEBUG = "true";
      // pretend the install destination exists
      fs.existsSync.mockReturnValue(true);

      mockInstaller.getManifest.mockReturnValue({
        name: "test-extension",
        version: "0.1.0",
      });

      // old install
      fs.readFileSync
        .mockReturnValueOnce(
          JSON.stringify({
            name: "test-extension",
            version: "0.1.0",
          })
        )

        .mockReturnValueOnce(
          JSON.stringify({
            name: "test-extension",
            version: "0.2.0",
          })
        );

      installExtension("test-extension");

      expect(mockInstaller.installTo).toHaveBeenCalled();
      expect(copyAssets).toHaveBeenCalled();
    });

    test("throws an error when no version is defined", () => {
      const t = () => {
        mockInstaller.getManifest.mockReturnValue({
          name: "test-extension",
        });

        installExtension("test-extension");
      };

      expect(t).toThrow(Error);
      expect(t).toThrow(
        "Cannot install extension test-extension without declaring a 'version'"
      );
    });
  });

  describe("unsupported installer", () => {
    beforeEach(() => {
      getInstallers.mockReturnValue([mockInstaller, mockInstaller2]);
    });

    test("iterates over installers to find a supported one", () => {
      // pretend net new
      fs.existsSync.mockReturnValue(false);
      getInstallers.mockReturnValue([mockInstaller, mockInstaller2]);

      mockInstaller.supportsInstalling.mockReturnValue(false);
      mockInstaller2.supportsInstalling.mockReturnValue(true);
      mockInstaller2.getManifest.mockReturnValue({
        name: "test-extension-2",
        version: "0.1.0",
      });

      installExtension("test-extension-2");

      expect(mockInstaller.installTo).not.toHaveBeenCalled();
      expect(mockInstaller2.installTo).toHaveBeenCalled();
      expect(copyAssets).toHaveBeenCalled();
    });

    test("throws error when all installers are exhausted", () => {
      const t = () => {
        mockInstaller.supportsInstalling.mockReturnValue(false);
        mockInstaller2.supportsInstalling.mockReturnValue(false);

        installExtension("test-extension.patch");
      };

      expect(t).toThrow(Error);
      expect(t).toThrow("No installer can handle test-extension.patch");
    });
  });
});
