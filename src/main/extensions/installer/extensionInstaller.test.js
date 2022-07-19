
jest.mock('./copyUtils');

jest.mock('fs');
const fs = require('fs');

import { installExtension } from './extensionInstaller'

describe("extensionInstaller", () => {

  test("does it", () => {

    installExtension('somePath');

  });
});