import { logCleaner } from './logCleaner'
jest.mock('./logCleaner', () => {
  return {
    logCleaner: jest.fn()
  }
});

jest.mock('electron-log');
const electronLog = require('electron-log');

import Logger from "./logger";

describe('Logger', () => {

  let mockLogger;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn()
    }
    electronLog.scope.mockImplementation(() => mockLogger);
  });

  test('creates scoped logger', () => {
    electronLog.scope = jest.fn();

    const loggy = Logger.create('testFile');

    expect(electronLog.scope).toHaveBeenCalledWith('testFile');
    // calls log cleaner on load
    expect(logCleaner).toHaveBeenCalledTimes(1);
  });

  test('logEvent formats message correctly', () => {
    const loggy = Logger.create('testFile');

    loggy.logEvent('someEvent', 'received { foo }')

    expect(mockLogger.info).toHaveBeenCalledWith('[@ someEvent] received { foo }');
  });

  test('logMethod formats message correctly', () => {
    const loggy = Logger.create('testFile');

    loggy.logMethod('myMethod', 'received { foo }')

    expect(mockLogger.info).toHaveBeenCalledWith('[myMethod] received { foo }');
  });

  test('log formats message correctly', () => {
    const loggy = Logger.create('testFile');

    loggy.log('a random message')

    expect(mockLogger.info).toHaveBeenCalledWith('a random message');
  });

});