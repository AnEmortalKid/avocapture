jest.mock('electron-log');

const electronLog = require('electron-log');

import ExtensionLogger from './extensionLogger';

describe('extensionLogger', () => {

  let mockLogger;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    }
    electronLog.scope.mockImplementation(() => mockLogger);
  });

  test('creates scoped log', () => {
    electronLog.scope = jest.fn()
    const el = new ExtensionLogger('testFile');

    expect(electronLog.scope).toHaveBeenCalledWith('testFile');
  });

  test('info delegates to electron logger', () => {
    const el = new ExtensionLogger('testFile');
    el.info('msg');

    expect(mockLogger.info).toHaveBeenCalledWith('msg');
  });

  test('warn delegates to electron logger', () => {
    const el = new ExtensionLogger('testFile');
    el.warn('msg');

    expect(mockLogger.warn).toHaveBeenCalledWith('msg');
  });

  test('error delegates to electron logger', () => {
    const el = new ExtensionLogger('testFile');
    el.error('msg');

    expect(mockLogger.error).toHaveBeenCalledWith('msg');
  });

  test('debug delegates to electron logger', () => {
    const el = new ExtensionLogger('testFile');
    el.debug('msg');

    expect(mockLogger.debug).toHaveBeenCalledWith('msg');
  });
});