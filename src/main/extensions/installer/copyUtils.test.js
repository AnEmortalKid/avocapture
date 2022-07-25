jest.mock("fs");
const fs = require("fs");
const { copyDirectory, copyAssets } = require("./copyUtils");

const path = require("path");

describe("copyUtils", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("copyDirectory", () => {
    test("creates destination", () => {
      fs.readdirSync.mockReturnValue([]);

      copyDirectory("source", "destination");

      expect(fs.mkdirSync).toHaveBeenCalledWith("destination", {
        recursive: true,
      });
    });

    test("copies files", () => {
      fs.readdirSync.mockReturnValue([
        { name: "someFile", isDirectory: () => false },
      ]);

      copyDirectory("source", "destination");

      expect(fs.readdirSync).toHaveBeenCalledWith("source", {
        withFileTypes: true,
      });
      expect(fs.copyFileSync).toHaveBeenCalledWith(
        path.join("source", "someFile"),
        path.join("destination", "someFile")
      );
    });

    test("copies files in subdirectories", () => {
      fs.readdirSync
        .mockReturnValueOnce([{ name: "subdir", isDirectory: () => true }])
        .mockReturnValue([{ name: "childFile", isDirectory: () => false }]);

      copyDirectory("source", "destination");

      expect(fs.readdirSync).toHaveBeenCalledWith(
        path.join("source", "subdir"),
        { withFileTypes: true }
      );
      expect(fs.copyFileSync).toHaveBeenCalledWith(
        path.join("source", "subdir", "childFile"),
        path.join("destination", "subdir", "childFile")
      );
    });
  });

  describe("copyAssets", () => {
    const expectedPaths = ["css", "font-awesome-4.7.0"];
    test.each(expectedPaths)("copies %s to sub asset dir", (assetDir) => {
      // pretend empty
      fs.readdirSync.mockReturnValue([]);
      copyAssets("destination");

      // copies from root to destination subdir
      expect(fs.readdirSync).toHaveBeenCalledWith(
        path.join(__dirname, assetDir),
        { withFileTypes: true }
      );
      expect(fs.mkdirSync).toHaveBeenCalledWith(
        path.resolve("destination", "assets", assetDir),
        { recursive: true }
      );
    });
  });
});
