const log = require("electron-log");

export default class ExtensionLogger {
  constructor(extensionName) {
    this.logger = log.scope(extensionName);
  }

  /**
   * Log an error message
   */
  error(...params) {
    this.logger.error(...params);
  }

  /**
   * Log a warning message
   */
  warn(...params) {
    this.logger.warn(...params);
  }

  /**
   * Log an informational message
   */
  info(...params) {
    this.logger.info(...params);
  }

  /**
   * Log a debug message
   */
  debug(...params) {
    this.logger.debug(...params);
  }
}
