import { logCleaner } from './logCleaner'
jest.mock('./logCleaner', () => {
  return {
    logCleaner: jest.fn()
  }
});

jest.mock('electron-log');
const electronLog = require('electron-log');

import Logger from "./logger";

describe('setup', () => {
  test('works', () => {
    electronLog.scope = jest.fn();

    const loggy = Logger.create('testFile');

    expect(electronLog.scope).toHaveBeenCalled();


  });
});