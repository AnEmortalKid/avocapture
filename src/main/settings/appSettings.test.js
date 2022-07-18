const mockSet = jest.fn()


import { Store } from 'electron-store';

jest.mock("electron-store", () => {
  return jest.fn().mockImplementation(() => {
    return {
      set: (k, v) => mockSet(k, v)
    };
  })
})

// jest.mock('path/to/module', () => ({
//   X: jest.fn()
// }));

import { AppSettings } from "./appSettings";

describe("AppSettings", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("save stores key when provided with data", () => {
    const appSettings = new AppSettings();

    appSettings.save("someKey", 'valueObj');

    expect(mockSet).toHaveBeenCalledWith("someKey", "valueObj");
  });
});