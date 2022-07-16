/*
 * Auto sets the object to app: { app : { getPath }}
 */
// jest.mock('electron');
// import { app, clipboard } from 'electron';

// Results in 
//  Cannot read properties of undefined (reading 'getPath')
//import { app, clipboard } from 'electron';
// jest.mock('electron', () => {
//   return jest.fn().mockImplementation(() => {
//     return { app: jest.fn(), clipboard: jest.fn() };
//   })
// });

// from: mocking non-default class exports
// import { app, clipboard } from 'electron';
// jest.mock('electron', () => {
//    Works and lets you check for constructor calls:
//    Still ends up as "app.app"
//   return {
//     app: jest.fn().mockImplementation(() => {
//       return { getPath: jest.fn() };
//     }),
//     clipboard: jest.fn().mockImplementation(() => {
//       return { writeText: jest.fn() };
//     })
//   };
// });

// Still ends up as { app: { app, clipboard }}
// import * as electron from 'electron';
// jest.mock('electron', () => {
//   return {
//     app: {
//       getPath: jest.fn()
//     },
//     clipboard: {
//       writeText: jest.fn()
//     }
//   }
// });

import PathReader from './pathReader';

describe('sample setup', () => {
  test("is mocked", () => {
    // app.getPath = jest.fn().mockReturnValue('sampleDir');

    const pr = PathReader.create();

    expect(clipboard.writeText).toHaveBeenCalledWith('sampleDir');
  });
});