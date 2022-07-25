import { assetPaths } from "../../util/styling";

const fs = require("fs");
const path = require("path");

/**
 * Copies the contents from the given source, to the given destination recursively
 * @param {directory} source the source for files to copy
 * @param {directory} destination the destination for all files
 */
export function copyDirectory(source, destination) {
  fs.mkdirSync(destination, { recursive: true });
  fs.readdirSync(source, { withFileTypes: true }).forEach((entry) => {
    let sourcePath = path.join(source, entry.name);
    let destinationPath = path.join(destination, entry.name);

    entry.isDirectory()
      ? copyDirectory(sourcePath, destinationPath)
      : fs.copyFileSync(sourcePath, destinationPath);
  });
}

/**
 * Copies the common assets to the desired destination under an "assets" directory
 * @param {directory} destination  the parent destination to place the assets directory in
 */
export function copyAssets(destination) {
  for (var assetPath of assetPaths) {
    const assetDir = path.resolve(__dirname, assetPath);
    const destinationPath = path.resolve(destination, "assets", assetPath);
    copyDirectory(assetDir, destinationPath);
  }
}
