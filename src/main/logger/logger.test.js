jest.mock("electron-log");
const electronLog = require("electron-log");

import Logger from "./logger";

describe("Logger", () => {
  let mockLogger;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
    };
    electronLog.scope.mockImplementation(() => mockLogger);
  });

  test("creates scoped logger", () => {
    electronLog.scope = jest.fn();

    const loggy = Logger.create("testFile");

    expect(electronLog.scope).toHaveBeenCalledWith("testFile");
  });

  test("logEvent formats message correctly", () => {
    const loggy = Logger.create("testFile");

    loggy.logEvent("someEvent", "received { foo }");

    expect(mockLogger.info).toHaveBeenCalledWith(
      "[@ someEvent] received { foo }"
    );
  });

  test("logEvent logs without data", () => {
    const loggy = Logger.create("testFile");

    loggy.logEvent("someEvent");

    expect(mockLogger.info).toHaveBeenCalledWith("[@ someEvent]");
  });

  test("logMethod formats message correctly", () => {
    const loggy = Logger.create("testFile");

    loggy.logMethod("myMethod", "received { foo }");

    expect(mockLogger.info).toHaveBeenCalledWith("[myMethod] received { foo }");
  });

  test("logMethod logs without data", () => {
    const loggy = Logger.create("testFile");

    loggy.logMethod("myMethod");

    expect(mockLogger.info).toHaveBeenCalledWith("[myMethod]");
  });

  test("log formats message correctly", () => {
    const loggy = Logger.create("testFile");

    loggy.log("a random message");

    expect(mockLogger.info).toHaveBeenCalledWith("a random message");
  });
});
