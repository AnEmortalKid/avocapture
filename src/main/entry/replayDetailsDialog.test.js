jest.mock('forcefocus');
const forcefocus = require('forcefocus');

import { BrowserWindow } from 'electron';

let mock_setBackgroundColor = jest.fn();
let mock_setAlwaysOnTop = jest.fn();
let mock_setVisibleOnAllWorkspaces = jest.fn();
let mock_setFullScreenable = jest.fn();
let mock_loadURL = jest.fn();
let mock_once = jest.fn();
let mock_on = jest.fn();
let mock_close = jest.fn();
let mock_show = jest.fn();
let mock_minimize = jest.fn();
let mock_hide = jest.fn();

let mock_webContents = {
  on: jest.fn(),
  send: jest.fn()
}
jest.mock('electron', () => {
  return {
    BrowserWindow: jest.fn().mockImplementation(() => {
      return {
        setBackgroundColor: mock_setBackgroundColor,
        setAlwaysOnTop: mock_setAlwaysOnTop,
        setVisibleOnAllWorkspaces: mock_setVisibleOnAllWorkspaces,
        setFullScreenable: mock_setFullScreenable,
        loadURL: mock_loadURL,
        once: mock_once,
        close: mock_close,
        on: mock_on,
        show: mock_show,
        minimize: mock_minimize,
        hide: mock_hide,
        webContents: mock_webContents
      }
    }),
  }
});

const path = require("path");

import { ReplayDetailsDialog } from './replayDetailsDialog'
import { dialogBackgroundColor } from '../util/styling.js'
import { ReplayDetailsEvents } from './replayDetailsEvents';

import { EventEmitter } from "events";

describe("ReplayDetailsDialog", () => {

  afterEach(() => {
    jest.clearAllMocks();

    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');
  });

  test("show when uninitialized creates window", () => {
    const dd = new ReplayDetailsDialog();
    dd.show({
      replayUuuid: 'fake'
    });

    expect(mock_setBackgroundColor).toHaveBeenCalledWith(dialogBackgroundColor);
    expect(mock_setAlwaysOnTop).toHaveBeenCalledWith(true, "screen-saver");
    expect(mock_setVisibleOnAllWorkspaces).toHaveBeenCalledWith(true);
    expect(mock_setFullScreenable).toHaveBeenCalledWith(false);
    expect(mock_loadURL).toHaveBeenCalledWith(path.resolve(__dirname, "views", "replay", "index.html"))

    // sets listeners
    expect(mock_once).toHaveBeenCalledWith("ready-to-show", expect.any(Function));
    expect(mock_on).toHaveBeenCalledWith("show", expect.any(Function));
  });

  test("show when initialized does not re-create window", () => {
    let readyToShowCB;
    mock_once.mockImplementation((event, cb) => {
      readyToShowCB = cb;
    });

    const dd = new ReplayDetailsDialog();
    dd.show({
      replayUuuid: 'fake'
    });
    readyToShowCB();

    dd.show({
      replayUuuid: 'updated'
    });

    expect(mock_setBackgroundColor).toHaveBeenCalledTimes(1);
    expect(mock_setAlwaysOnTop).toHaveBeenCalledTimes(1);
    expect(mock_setVisibleOnAllWorkspaces).toHaveBeenCalledTimes(1);
    expect(mock_setFullScreenable).toHaveBeenCalledTimes(1);
    expect(mock_loadURL).toHaveBeenCalledTimes(1);

    // sets listeners
    expect(mock_once).toHaveBeenCalledTimes(1);
    expect(mock_on).toHaveBeenCalledTimes(1);

    // one initial and one on second
    expect(mock_show).toHaveBeenCalledTimes(2);
    expect(mock_webContents.send).toHaveBeenCalledTimes(2);

    expect(mock_webContents.send).toHaveBeenCalledWith(ReplayDetailsEvents.DIALOG.INITIALIZE, {
      replayUuuid: 'updated'
    });
  });

  test("show ready-to-show listener, invokes webcontents and displays", () => {
    const emitter = new EventEmitter();
    mock_once.mockImplementation((event, cb) => emitter.once(event, cb))


    const dd = new ReplayDetailsDialog();
    dd.show({
      replayUuuid: 'fake'
    });
    emitter.emit("ready-to-show");

    expect(mock_webContents.send).toHaveBeenCalledWith(ReplayDetailsEvents.DIALOG.INITIALIZE, {
      replayUuuid: 'fake'
    });
    expect(mock_show).toHaveBeenCalled();
  });

  test("show before-input-event listener, hides dialog on Escape", () => {
    const emitter = new EventEmitter();
    mock_once.mockImplementation((event, cb) => emitter.once(event, cb))

    mock_webContents.on.mockImplementation((event, cb) => {
      emitter.on(event, cb);
    });

    const dd = new ReplayDetailsDialog();
    dd.show({
      replayUuuid: 'fake'
    });
    emitter.emit("ready-to-show");
    emitter.emit("before-input-event", null, { key: "Escape" });

    expect(mock_webContents.on).toHaveBeenCalledWith("before-input-event", expect.any(Function));
    expect(mock_minimize).toHaveBeenCalled();
    expect(mock_hide).toHaveBeenCalled();
  });

  test("show before-input-event listener, does nothing on other keys", () => {
    const emitter = new EventEmitter();
    mock_once.mockImplementation((event, cb) => emitter.once(event, cb))
    mock_webContents.on.mockImplementation((event, cb) => {
      emitter.on(event, cb);
    });

    const dd = new ReplayDetailsDialog();
    dd.show({
      replayUuuid: 'fake'
    });
    emitter.emit("ready-to-show");
    emitter.emit("before-input-event", null, { key: "Enter" });

    expect(mock_webContents.on).toHaveBeenCalledWith("before-input-event", expect.any(Function));
    expect(mock_minimize).not.toHaveBeenCalled();
    expect(mock_hide).not.toHaveBeenCalled();
  });

  test("show event calls forcefocus after timeout", async () => {
    const emitter = new EventEmitter();
    mock_on.mockImplementation((event, cb) => emitter.once(event, cb))

    const dd = new ReplayDetailsDialog();
    dd.show({
      replayUuuid: 'fake'
    });
    emitter.emit("show");

    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 200);

    jest.advanceTimersByTime(200);
    await Promise.resolve();

    expect(forcefocus.focusWindow).toHaveBeenCalledWith(dd.entryWindow);
  });

  test("destroy closes window", () => {
    const dd = new ReplayDetailsDialog();
    dd.show({});

    dd.destroy();
    expect(mock_close).toHaveBeenCalled();
  });

  test("hide does nothing when window not created", () => {
    const dd = new ReplayDetailsDialog();

    dd.hide();
    expect(mock_close).not.toHaveBeenCalled();
  });

  test("destroy does nothing when window not created", () => {
    const dd = new ReplayDetailsDialog();

    dd.destroy();
    expect(mock_close).not.toHaveBeenCalled();
  });
});