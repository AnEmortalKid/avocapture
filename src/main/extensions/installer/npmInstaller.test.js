jest.mock("fs");
const fs = require("fs");

const path = require("path");

jest.mock("command-exists");
const commandExistsSync = require("command-exists").sync;

jest.mock("child_process");
const execSync = require("child_process").execSync;

jest.mock("./copyUtils");
import { copyDirectory } from "./copyUtils";

import { NpmInstaller } from "./npmInstaller";

describe("NpmInstaller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getManifest", () => {
    test("reads package.json", () => {
      fs.readFileSync.mockReturnValue(
        JSON.stringify({
          name: "test-extension",
          version: "0.1.0",
        })
      );

      const installer = new NpmInstaller();
      const manifest = installer.getManifest("someDir");
      expect(manifest.version).toBe('0.1.0');

      expect(fs.readFileSync).toHaveBeenCalledWith(
        path.join("someDir", "package.json")
      );
    });
  });

  describe("supportsInstalling", () => {
    test("returns false on not a directory", () => {
      fs.lstatSync.mockReturnValue({
        isDirectory: () => false,
      });

      const installer = new NpmInstaller();
      const result = installer.supportsInstalling("someFile");

      expect(fs.lstatSync).toHaveBeenCalledWith("someFile");
      expect(result).toBeFalsy();
    });

    test("returns false when npm is missing", () => {
      fs.lstatSync.mockReturnValue({
        isDirectory: () => true,
      });

      commandExistsSync.mockReturnValue(false);
      const installer = new NpmInstaller();
      const result = installer.supportsInstalling("someDir");

      expect(commandExistsSync).toHaveBeenCalledWith("npm");
      expect(result).toBeFalsy();
    });

    test("returns true when dir and npm exists", () => {
      fs.lstatSync.mockReturnValue({
        isDirectory: () => true,
      });

      commandExistsSync.mockReturnValue(true);

      const installer = new NpmInstaller();
      const result = installer.supportsInstalling("someDir");
      expect(result).toBeTruthy();
    });
  });

  describe("installTo", () => {
    test("copies files and executes npm install", () => {
      const extDir = "test-extension";
      const installer = new NpmInstaller();
      installer.installTo("someDir", extDir);

      expect(copyDirectory).toHaveBeenCalledWith("someDir", extDir);
      expect(execSync).toHaveBeenCalledWith(
        "npm install --omit=dev",
        { cwd: extDir },
        expect.any(Function)
      );
    });
  });
});
