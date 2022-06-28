class EchoUploader {
  upload(replayData) {
    console.log(
      "[test-console-echo-uploader] upload ",
      JSON.stringify(replayData)
    );
  }

  /**
   * Initializes the state of the extension based on the given settings.
   *
   * @param {*} settings the settings specific to this extension
   */
  initialize(settings) {
    console.log("[test-console-echo-uploader] initialize ", settings);
  }

  /**
   * Destroys any state the extension requires
   */
  teardown() {
    console.log("[test-console-echo-uploader] teardown");
  }

  /**
   * The extension's settings are in the process of being modified
   */
  notifyModifying() {
    console.log("[test-console-echo-uploader] notifyModifying");
  }

  /**
   * The extension has new settings
   *
   * @param {*} newSettings the new settings
   */
  notifyModifyApply(newSettings) {
    console.log("[test-console-echo-uploader] notifyModifyApply", newSettings);
  }

  /**
   * The extension's settings were not changed.
   */
  notifyModifyCancel() {
    console.log("[test-console-echo-uploader] notifyModifyCancel");
  }
}

module.exports = EchoUploader;
