
export default class Logger {
  constructor(owner) {
    this.owner = owner;
  }

  logEvent(eventName, data) {
    console.log(`[${this.owner}@${eventName}]`, data ? data : "");
  }

  logMethod(method, data) {
    console.log(`[${this.owner}.${method}]`, data ? data : "");
  }

  log(msg) {
    console.log(`[${this.owner}]`, msg);
  }

}