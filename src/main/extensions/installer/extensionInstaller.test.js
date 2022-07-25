jest.mock("./copyUtils");

jest.mock("fs");
const fs = require("fs");

jest.mock("child_process");

jest.mock("electron", () => {
  return {
    app: {
      getPath: jest.fn().mockReturnValue("fakeUserData"),
    },
  };
});

import { copyDirectory, copyAssets } from "./copyUtils";

import installExtension from "./extensionInstaller";

const execSync = require("child_process").execSync;
const path = require("path");

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

  test("installs net new extension", () => {
    fs.readFileSync.mockReturnValue(
      JSON.stringify({
        name: "test-extension",
        version: "0.1.0",
      })
    );

    installExtension("test-extension");

    const extensionInstallDir = path.join(
      "fakeUserData",
      "extensions",
      "test-extension"
    );

    expect(copyDirectory).toHaveBeenCalledWith(
      "test-extension",
      extensionInstallDir
    );
    expect(execSync).toHaveBeenCalledWith(
      "npm install --omit=dev",
      { cwd: extensionInstallDir },
      expect.any(Function)
    );
    expect(copyAssets).toHaveBeenCalledWith(extensionInstallDir);
  });

  test("installs new version of an extension", () => {
    // pretend the install destination exists
    fs.existsSync.mockReturnValue(true);

    fs.readFileSync
      .mockReturnValueOnce(
        JSON.stringify({
          name: "test-extension",
          version: "0.2.0",
        })
      )
      // old install
      .mockReturnValueOnce(
        JSON.stringify({
          name: "test-extension",
          version: "0.1.0",
        })
      );

    installExtension("test-extension");

    expect(copyDirectory).toHaveBeenCalled();
    expect(execSync).toHaveBeenCalled();
    expect(copyAssets).toHaveBeenCalled();
  });

  test("does not install older extension", () => {
    // pretend the install destination exists
    fs.existsSync.mockReturnValue(true);

    fs.readFileSync
      .mockReturnValueOnce(
        JSON.stringify({
          name: "test-extension",
          version: "0.1.0",
        })
      )
      // old install
      .mockReturnValueOnce(
        JSON.stringify({
          name: "test-extension",
          version: "0.2.0",
        })
      );

    installExtension("test-extension");

    expect(copyDirectory).not.toHaveBeenCalled();
    expect(execSync).not.toHaveBeenCalled();
    expect(copyAssets).not.toHaveBeenCalled();
  });

  test("overwrites when avocaptureDebug", () => {
    process.env.AVOCAPTURE_DEBUG = "true";
    // pretend the install destination exists
    fs.existsSync.mockReturnValue(true);

    fs.readFileSync
      .mockReturnValueOnce(
        JSON.stringify({
          name: "test-extension",
          version: "0.1.0",
        })
      )
      // old install
      .mockReturnValueOnce(
        JSON.stringify({
          name: "test-extension",
          version: "0.2.0",
        })
      );

    installExtension("test-extension");

    expect(copyDirectory).toHaveBeenCalled();
    expect(execSync).toHaveBeenCalled();
    expect(copyAssets).toHaveBeenCalled();
  });

  test("throws an error when no version is defined", () => {
    const t = () => {
      fs.readFileSync.mockReturnValueOnce(
        JSON.stringify({
          name: "test-extension",
        })
      );

      installExtension("test-extension");
    };

    expect(t).toThrow(Error);
    expect(t).toThrow(
      "Cannot install extension test-extension without declaring a 'version'"
    );
  });
});
