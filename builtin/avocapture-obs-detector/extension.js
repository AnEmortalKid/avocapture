const OBSWebSocket = require('obs-websocket-js').default;
const path = require('path');

class ObsEventDetector {

  constructor(options) {
    this.logger = options.logger;

    this.obs = new OBSWebSocket();
    this.isConnected = false;
  }

  _connect(settings) {
    // TODO setInterval for attempting connections

    // TODO handle settings changes, etc
    this.obs.connect().then((ack) => {
      this.logger.info('Received ack:', ack);
      this.isConnected = true;
      this.obs.on('ReplayBufferSaved', (data) => {
        this.logger.info('Got response', data);
        this.logger.info('Calling', this.detectListener);
        const fileName = path.basename(data.savedReplayPath);
        this.logger.info('fileName', fileName);
        this.detectListener.detected({
          filePath: data.savedReplayPath,
          fileName: fileName
        });
      });
    }).catch((error) => {
      this.logger.error('Failed to connect', error.code, error.message);
      this.isConnected = false;
    });
  }

  /**
   * Initializes the state of the extension based on the given settings.
   *
   * @param {*} settings the settings specific to this extension
   */
  initialize(settings) {
    this.logger.info(`initializing with ${JSON.stringify(settings)}`);
    this._connect(settings);
  }

  /**
   * Destroys any state the extension requires
   */
  teardown() {
    // TODO clear reconnect otherwise
    if (this.isConnected) {
      this.obs.disconnect();
    }
  }

  /**
   * The extension's settings are in the process of being modified.
   *
   * An extension can use this function to pause any side processes (example: a listener for ShadowPlay) while the settings are being modified.
   */
  notifyModifying() {

  }

  /**
   * The extension has new settings
   *
   * @param {*} newSettings the new settings specific to this extension
   */
  notifyModifyApply(newSettings) {

  }

  /**
   * The extension's settings were not changed.
   */
  notifyModifyCancel() {

  }

  /**
   * Registers a listener with this detector.
   */
  register(detectListener) {
    this.logger.info('Registering detection listener.');
    this.detectListener = detectListener;
  }
}

module.exports = ObsEventDetector;