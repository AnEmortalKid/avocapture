jest.mock('electron-log');

const electronLog = require('electron-log');

import ExtensionLogger from './extensionLogger';

describe('extensionLogger', () => {

  test('creates scoped log', () => {

    const el = new ExtensionLogger('testFile');

    expect(electronLog.scope).toHaveBeenCalledWith('testFile');
  });
});