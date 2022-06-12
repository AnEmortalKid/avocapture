const fs = require("fs")
const path = require("path")

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