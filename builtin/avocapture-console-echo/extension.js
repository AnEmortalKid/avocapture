class TestDetector {

  register(listener) {
    console.log('[console-echo] register', listener);
  }

  /**
   * Initializes the state of the extension based on the given settings.
   * 
   * @param {*} settings the settings specific to this extension
   */
  initialize(settings) {
    console.log('[console-echo] initialize ', settings);
  }

  /**
   * Destroys any state the extension requires
   */
  teardown() {
    console.log("[console-echo] teardown");
  }

  /**
   * The extension's settings are in the process of being modified
   */
  notifyModifying() {
    console.log("[console-echo] notifyModifying");
  }

  /**
   * The extension has new settings
   * 
   * @param {*} newSettings the new settings
   */
  notifyModifyApply(newSettings) {
    console.log("[console-echo] notifyModifyApply", newSettings);
  }

  /**
   * The extension's settings were not changed.
   */
  notifyModifyCancel() {
    console.log("[console-echo] notifyModifyCancel");
  }
}

module.exports = TestDetector