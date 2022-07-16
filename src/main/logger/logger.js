import { logCleaner } from "./logCleaner";
logCleaner();

const log = require("electron-log");

export default class Logger {
  /**
   * Creates a new logger scoped to the given owner
   * @param {string} owner of the logger
   * @returns a new logger
   */
  static create(owner) {
    return new Logger(owner);
  }

  constructor(owner) {
    this.ownerLog = log.scope(owner);
  }

  logEvent(eventName, data) {
    this.ownerLog.info(`[@ ${eventName}] ${data ? data : ""}`);
  }

  logMethod(method, data) {
    this.ownerLog.info(`[${method}] ${data ? data : ""}`);
  }

  log(msg) {
    this.ownerLog.info(msg);
  }
}
