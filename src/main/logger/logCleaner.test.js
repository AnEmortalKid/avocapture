import { app } from "electron";

const fs = require('fs');
jest.mock('fs');

const path = require('path');

import { logCleaner } from './logCleaner'

describe("logCleaner", () => {

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("removes main log when it exists", () => {
    app.getPath.mockReturnValue("userTestDir");
    fs.existsSync.mockReturnValue(true)

    logCleaner();

    const expectedPath = path.join('userTestDir', "logs/main.log");
    expect(fs.existsSync).toHaveBeenCalledWith(expectedPath);
    expect(fs.rmSync).toHaveBeenCalledWith(expectedPath);
  });

  test("does not call rmSync when path does not exist", () => {
    app.getPath.mockReturnValue("userTestDir");
    fs.existsSync.mockReturnValue(false)

    logCleaner();

    const expectedPath = path.join('userTestDir', "logs/main.log");
    expect(fs.existsSync).toHaveBeenCalledWith(expectedPath);
    expect(fs.rmSync).not.toHaveBeenCalled();
  });
});