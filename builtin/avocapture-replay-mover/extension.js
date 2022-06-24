const fs = require('fs')
const path = require('path')

function log(msg) {
  console.log('[avocapture.replay-mover] ', msg)
}

class ReplayMover {

  /**
   * Initializes the state of the extension based on the given settings.
   * 
   * @param {*} settings the settings specific to this extension
   */
  initialize(settings) {
    this.destination = settings.destination;
  }

  /**
   * Destroys any state the extension requires
   */
  teardown() {
    // intentionally do nothing
  }

  /**
   * The extension's settings are in the process of being modified
   */
  notifyModifying() {
    // intentionally do nothing
  }

  /**
   * The extension has new settings
   * 
   * @param {*} newSettings the new settings
   */
  notifyModifyApply(newSettings) {
    this.destination = newSettings.destination;
  }

  /**
   * The extension's settings were not changed.
   */
  notifyModifyCancel() {
    // intentionally do nothing
  }

  upload(replayData) {
    log(`Received data ${JSON.stringify(replayData)}`)
    if (this.destination && this.destination.length > 0) {
      const destinationPath = path.join(this.destination, replayData.fileName);
      log(`Computed destination ${destinationPath}`)
      fs.renameSync(replayData.filePath, destinationPath);
    }
    else {
      log('No destination to upload to!')
    }
  }
}

module.exports = ReplayMover
