const OBSWebSocket = require('obs-websocket-js').default;
const path = require('path');

class ObsEventDetector {

  constructor(options) {
    this.logger = options.logger;

    this.obs = new OBSWebSocket();
    this.isConnected = false;

    // track an interval
    this.connectIntervalId = null;
  }

  _tryConnecting(settings) {
    if (this.isConnected) {
      this._stopConnectPolling();
      return;
    }

    const { serverPort, serverPassword } = settings;

    this.obs.connect(`ws://127.0.0.1:${serverPort}`, serverPassword, { rpcVersion: 1 })
      .then((ack) => {
        this.logger.info('Received [Hello]: ', ack);
        this.isConnected = true;
        this._stopConnectPolling();

        this.obs.on('ReplayBufferSaved', (data) => {
          this.logger.info('Received response for [ReplayBufferSaved]: ', data);

          const fileName = path.basename(data.savedReplayPath);
          this.detectListener.detected({
            filePath: data.savedReplayPath,
            fileName: fileName
          });
        });

        this.obs.on('ExitStarted', () => {
          // set an interval
          this.logger.info('OBS is exiting, re-polling');

          // remove existing listeners
          this._removeListeners();
          this.isConnected = false;

          // restart poller in case obs comes back
          this._startConnectPolling(settings);
        });

        // on close , set reconnection
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

    // if already in interval, re-init
    if (this.connectIntervalId) {
      this._stopConnectPolling();
    }

    this._startConnectPolling(settings);
  }

  _stopConnectPolling() {
    clearInterval(this.connectIntervalId);
    this.connectIntervalId = null;
  }

  _startConnectPolling(settings) {
    // safeguard against unset values
    let reconnectIntervalMS = 3000;
    if (settings.reconnectIntervalSeconds) {
      reconnectIntervalMS = settings.reconnectIntervalSeconds * 1000
    }

    this.connectIntervalId = setInterval(
      () => {
        this._tryConnecting(settings)
      },
      2000
    );
  }

  _removeListeners() {
    this.obs.off('ReplayBufferSaved');
    this.obs.off('ExitStarted');
  }

  /**
   * Destroys any state the extension requires
   */
  teardown() {
    if (this.isConnected) {
      this._removeListeners();
      this.obs.disconnect();
      this.isConnected = false;
    }
    else {
      this._stopConnectPolling();
    }
  }

  /**
   * The extension has new settings
   *
   * @param {*} newSettings the new settings specific to this extension
   */
  notifyModifyApply(newSettings) {
    this.logger.info(`modify ${JSON.stringify(newSettings)}`);
    this.teardown();

    // if already in interval, re-init
    if (this.connectIntervalId) {
      this._stopConnectPolling();
    }

    this._startConnectPolling(settings);
  }

  /**
   * The extension's settings were not changed.
   */
  notifyModifyCancel() {
    // nothing changed
  }

  /**
 * The extension's settings are in the process of being modified.
 *
 * An extension can use this function to pause any side processes (example: a listener for ShadowPlay) while the settings are being modified.
 */
  notifyModifying() {
    // do nothing
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