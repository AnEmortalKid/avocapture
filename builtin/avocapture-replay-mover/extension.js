const fs = require('fs')
const path = require('path')

class ReplayMover {

  constructor(opts) {
    const { logger } = opts
    this.logger = logger;
  }

  /**
   * Initializes the state of the extension based on the given settings.
   * 
   * @param {*} settings the settings specific to this extension
   */
  initialize(settings) {
    this.logger.info(`initializing with ${JSON.stringify(settings)}`);
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
    this.logger.info(`Received data ${JSON.stringify(replayData)}`);
    if (this.destination && this.destination.length > 0) {
      const destinationPath = path.join(this.destination, replayData.fileName);
      this.logger.info(`Computed destination ${destinationPath}`)
      fs.renameSync(replayData.filePath, destinationPath);
    }
    else {
      this.logger.info('No destination to upload to!')
    }
  }
}

module.exports = ReplayMover
