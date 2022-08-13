export class BaseExtensionInstaller {
  /**
   * Determines whether this installer is able to install an extension located at the given path.
   */
  supportsInstalling(extensionPath) {
    throw new Error("Not Implemented");
  }

  /**
   * Installs the extension located at the given path to the desired destination
   * @param {file} extensionPath
   * @param {directory} installationDestination
   */
  installTo(extensionPath, installationDestination) {
    throw new Error("Not Implemented");
  }

  /**
   * Returns an object with the contents of the package.json.
   *
   * Each installer is responsible for determining the mechanism needed to read this information.
   *
   * @param {file} extensionPath a file path to where the extension is defined
   */
  getManifest(extensionPath) {
    throw new Error("Not Implemented");
  }
}
