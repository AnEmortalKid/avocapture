// This works with require
// jest.mock('electron', () => {
//   return {
//     app: {
//       getPath: jest.fn()
//     },
//   };
// });

// did not work
// jest.mock('electron', () => {
//   // Require the original module to not be mocked...
//   // const originalModule = jest.requireActual('electron');

//   return {
//     __esModule: true, // Use it when dealing with esModules
//     //...originalModule,
//     app: { getPath: jest.fn().mockReturnValue('testUserData') },
//   };
// });

// this is so dumb
jest.mock('electron', () => ({
  __esModule: true, // this property makes it work
  getPath: jest.fn(),
}));
import { app } from 'electron'


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