jest.mock('fs');
const fs = require("fs");
const { copyDirectory } = require("./copyUtils");

const path = require("path");


describe("copyUtils", () => {

  afterEach(() => {
    jest.clearAllMocks();
  })

  describe("copyDirectory", () => {

    test("creates destination", () => {
      fs.readdirSync.mockReturnValue([]);

      copyDirectory('source', 'destination');

      expect(fs.mkdirSync).toHaveBeenCalledWith("destination", { recursive: true });
    });

    test("copies files", () => {
      fs.readdirSync.mockReturnValue([{ name: "someFile", isDirectory: () => false }]);

      copyDirectory('source', 'destination');

      expect(fs.readdirSync).toHaveBeenCalledWith("source", { withFileTypes: true });
      expect(fs.copyFileSync).toHaveBeenCalledWith(path.join("source", "someFile"), path.join("destination", "someFile"));
    });


    test("copies files in subdirectories", () => {
      fs.readdirSync.mockReturnValueOnce([{ name: "subdir", isDirectory: () => true }])
        .mockReturnValue([{ name: "childFile", isDirectory: () => false }]);

      copyDirectory('source', 'destination');

      expect(fs.readdirSync).toHaveBeenCalledWith(path.join("source", "subdir"), { withFileTypes: true });
      expect(fs.copyFileSync).toHaveBeenCalledWith(
        path.join("source", "subdir", "childFile"), path.join("destination", "subdir", "childFile"));
    });
  });
});