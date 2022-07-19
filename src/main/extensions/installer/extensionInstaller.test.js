
jest.mock('./copyUtils');

jest.mock('fs');
const fs = require('fs');

jest.mock('child_process')

jest.mock('electron', () => {
  return {
    app: {
      getPath: jest.fn().mockReturnValue('fakeUserData')
    }
  }
});

import { copyDirectory, copyAssets } from './copyUtils'


import installExtension from './extensionInstaller'

const execSync = require('child_process').execSync;

describe("extensionInstaller", () => {

  // const env = process.env

  // beforeEach(() => {
  //   jest.resetModules()
  //   process.env = { ...env }
  // })

  // afterEach(() => {
  //   process.env = env
  // })

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("installs net new extension", () => {
    fs.readFileSync.mockReturnValue(JSON.stringify({
      name: "test-extension",
      version: "0.1.0",
    }));

    installExtension('test-extension');

    expect(execSync).toHaveBeenCalled();

  });

  test("installs new version of an extension", () => {

  });

  test("does not install older extension", () => {

  });
});