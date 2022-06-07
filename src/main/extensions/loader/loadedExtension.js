
/**
 * Encapsulates data about an extension that has been loaded from the filesystem
 */
export default class LoadedExtension {

  /**
   * 
   * @param {object} instance an instance of the created extension class
   * @param {obj} configuration the object with properties read from the package.json
   * @param {filePath} extensionPath a file path to where the extension's sources are located
   */
  constructor(instance, configuration, extensionPath) {
    this.instance = instance;
    this.configuration = configuration;
    this.extensionPath = extensionPath
  }

  name() {
    return this.configuration.name
  }

  type() {
    return this.configuration.type
  }
}