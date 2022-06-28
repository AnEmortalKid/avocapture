/**
 * Defines the lifecycle of every extension
 */
export class BaseExtension {
  /**
   * Initializes the state of the extension based on the given settings.
   *
   * @param {*} settings the settings specific to this extension
   */
  initialize(settings) {
    throw new Error("Unimplemented");
  }

  /**
   * Destroys any state the extension requires
   */
  teardown() {
    throw new Error("Unimplemented");
  }

  /**
   * The extension's settings are in the process of being modified
   */
  notifyModifying() {
    throw new Error("Unimplemented");
  }

  /**
   * The extension has new settings
   *
   * @param {*} newSettings the new settings
   */
  notifyModifyApply(newSettings) {
    throw new Error("Unimplemented");
  }

  /**
   * The extension's settings were not changed.
   */
  notifyModifyCancel() {
    throw new Error("Unimplemented");
  }
}
