jest.mock('forcefocus');

import { BrowserWindow } from 'electron';

let mock_setBackgroundColor = jest.fn();
let mock_setAlwaysOnTop = jest.fn();
let mock_setVisibleOnAllWorkspaces = jest.fn();
let mock_setFullScreenable = jest.fn()
jest.mock('electron', () => {

  return {
    BrowserWindow: jest.fn().mockImplementation(() => {
      return {
        setBackgroundColor: mock_setBackgroundColor,
        setAlwaysOnTop: mock_setAlwaysOnTop,
        setVisibleOnAllWorkspaces: mock_setVisibleOnAllWorkspaces,
        setFullScreenable: mock_setFullScreenable,
        loadURL: jest.fn(),
        once: jest.fn(),
        close: jest.fn(),
        on: jest.fn(),
        show: jest.fn(),
        webContents: {
          send: jest.fn()
        }
      }
    }),
  }
});

import { ReplayDetailsDialog } from './replayDetailsDialog'

describe("ReplayDetailsDialog", () => {

  afterEach(() => {
    jest.clearAllMocks()
  });

  test("show when uninitialized creates window", () => {
    const dd = new ReplayDetailsDialog();
    dd.show({
      replayUuuid: 'fake'
    });

    expect(mock_setBackgroundColor).toHaveBeenCalledTimes(1);

  });

  test("destroy  closes window", () => {
    const dd = new ReplayDetailsDialog();
    dd.show({});
    dd.show({});

    expect(mock_setBackgroundColor).toHaveBeenCalledTimes(1);

  });
});