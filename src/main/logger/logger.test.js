import { app } from 'electron';
jest.mock('electron', () => {
  return {
    getPath: jest.fn().mockReturnValue("testUserData")
  };
});


jest.mock('fs');
const fs = require('fs');

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