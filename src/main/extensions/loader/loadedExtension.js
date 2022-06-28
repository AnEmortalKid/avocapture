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
    this.extensionPath = extensionPath;
  }

  /**
   * @returns determines whether an extension is built in
   */
  isBuiltIn() {
    return this.builtIn;
  }

  /**
   * marks extension as built in
   */
  markBuiltIn() {
    this.builtIn = true;
  }

  name() {
    return this.configuration.name;
  }

  type() {
    return this.configuration.type;
  }

  display() {
    if (this.configuration.display) {
      return this.configuration.display;
    }
    return this.name();
  }

  description() {
    if (this.configuration.description) {
      return this.configuration.description;
    }
    return this.name();
  }
}
