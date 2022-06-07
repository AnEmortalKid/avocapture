class TestDetector {
  // TODO need to figure out how to make an extensible module here
  name() {
    return "TestDet";
  }

  register(listener) {
    console.log('register', listener);
  }

  /**
   * Initializes the state of the extension based on the given settings.
   * 
   * @param {*} settings the settings specific to this extension
   */
  initialize(settings) {
    console.log('initialize ', settings);
  }

  /**
   * Destroys any state the extension requires
   */
  teardown() {
    console.log("teardown");
  }

  /**
   * The extension's settings are in the process of being modified
   */
  notifyModifying() {
    console.log("notifyModifying");
  }

  /**
   * The extension has new settings
   * 
   * @param {*} newSettings the new settings
   */
  notifyModifyApply(newSettings) {
    console.log("notifyModifyApply", newSettings);
  }

  /**
   * The extension's settings were not changed.
   */
  notifyModifyCancel() {
    console.log("notifyModifyCancel");
  }
}

module.exports = TestDetector