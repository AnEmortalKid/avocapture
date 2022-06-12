import { copyDirectory } from "./dirCopy";

const path = require("path")

const assetPaths = ["css", "font-awesome-4.7.0"];

export default function copyAssets(installedExtensionPath) {

  for (var assetPath of assetPaths) {
    const assetDir = path.resolve(__dirname, assetPath);
    const destinationPath = path.resolve(installedExtensionPath, "assets", assetPath);
    copyDirectory(assetDir, destinationPath);
  }
}