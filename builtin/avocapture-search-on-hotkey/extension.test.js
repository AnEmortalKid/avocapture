const mockLogger = {
  info: jest.fn(),
  error: jest.fn()
};

const { GlobalKeyboardListener } = require("node-global-key-listener");
const HotkeyReplayDetector = require("./extension");
jest.mock('node-global-key-listener');

const fs = require('fs');
const path = require("path");
jest.mock('fs')

describe("extension", () => {

  let mockAddListener = jest.fn()
  let mockRemoveListener = jest.fn()
  let mockKill = jest.fn()

  beforeEach(() => {
    GlobalKeyboardListener.mockImplementation(() => {
      return {
        addListener: mockAddListener,
        removeListener: mockRemoveListener,
        kill: mockKill
      }
    });

    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');
  });

  const defaults = {
    "vKey": 111,
    "browserName": "NumpadDivide",
    "replayDirectory": "replayDir",
    "hotkeyDelayMS": 500
  }

  describe("detection mechanism", () => {

    test("notifies detector on desired key", () => {
      const sok = new HotkeyReplayDetector({ logger: mockLogger });
      sok.initialize(defaults);

      const detectionListener = {
        detected: jest.fn()
      };

      sok.register(detectionListener);
      const keyListener = sok.keyListener;

      const event = {
        state: "DOWN",
        vKey: 111
      };

      // pretend a hotkey is pressed
      keyListener(event, false);

      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 500);
    });

    test("does nothing on other presses", () => {
      const sok = new HotkeyReplayDetector({ logger: mockLogger });
      sok.initialize(defaults);

      const detectionListener = {
        detected: jest.fn()
      };

      sok.register(detectionListener);
      const keyListener = sok.keyListener;

      const event = {
        state: "DOWN",
        vKey: 112
      };

      // pretend a hotkey is pressed
      keyListener(event, false);

      expect(setTimeout).not.toHaveBeenCalled();
    });

    describe("search mechanism", () => {
      const sok = new HotkeyReplayDetector({ logger: mockLogger });
      sok.initialize(defaults);

      let detectionListener;
      let keyListener;

      const event = {
        state: "DOWN",
        vKey: 111
      };

      beforeEach(() => {
        detectionListener = {
          detected: jest.fn()
        };

        sok.register(detectionListener);
        keyListener = sok.keyListener;
      });

      test("notifies listener when a file is found", () => {
        // setup files search
        fs.readdirSync.mockReturnValue(["firstReplay.mp4"]);
        fs.lstatSync.mockReturnValue({
          isDirectory: () => false,
          ctimeMs: 100
        });

        // pretend a hotkey is pressed
        keyListener(event, false);
        jest.advanceTimersByTime(500);

        expect(detectionListener.detected).toHaveBeenCalledWith({ fileName: 'firstReplay.mp4', filePath: path.join('replayDir', 'firstReplay.mp4') });
      });


      test("Uses most recent replay", () => {
        // setup files search
        fs.readdirSync.mockReturnValue(["replay1.mp4", "replay3.mp4", "replay2.mp4"]);
        fs.lstatSync.mockReturnValueOnce({
          isDirectory: () => false,
          ctimeMs: 100
        }).mockReturnValueOnce({
          isDirectory: () => false,
          ctimeMs: 700
        }).mockReturnValueOnce({
          isDirectory: () => false,
          ctimeMs: 400
        });

        // pretend a hotkey is pressed
        keyListener(event, false);
        jest.advanceTimersByTime(500);

        expect(detectionListener.detected).toHaveBeenCalledWith({ fileName: 'replay3.mp4', filePath: path.join('replayDir', 'replay3.mp4') });
      });

      test("Ignores empty dir", () => {
        fs.readdirSync.mockReturnValue([]);

        keyListener(event, false);
        jest.advanceTimersByTime(500);

        expect(detectionListener.detected).not.toHaveBeenCalled();
      });

      test("Ignores subdirectories", () => {
        fs.readdirSync.mockReturnValue(["subDir"]);
        fs.lstatSync.mockReturnValue({
          isDirectory: () => true,
          ctimeMs: 100
        })

        keyListener(event, false);
        jest.advanceTimersByTime(500);

        expect(detectionListener.detected).not.toHaveBeenCalled();
      });

    });
  });

  // hotkey notifies detector

  describe("modify flow", () => {

    test("notifyModifying removes current listener", () => {
      const sok = new HotkeyReplayDetector({ logger: mockLogger });
      sok.initialize(defaults);
      const old = sok.keyListener;

      sok.notifyModifying();

      expect(mockRemoveListener).toHaveBeenCalledWith(old);
    });

    test("notifyModifyCancel restores old listener", () => {
      const sok = new HotkeyReplayDetector({ logger: mockLogger });
      sok.initialize(defaults);
      const old = sok.keyListener;
      sok.notifyModifying();
      // should restore state
      sok.notifyModifyCancel();
      expect(mockAddListener).toHaveBeenCalledWith(old);
    });

    test("modifyApply adds a new bound listener", () => {
      const sok = new HotkeyReplayDetector({ logger: mockLogger });
      sok.initialize(defaults);
      sok.notifyModifying();
      const newSettings = {
        vKey: 112,
        ...defaults
      }
      sok.notifyModifyApply(newSettings)
      const newListener = sok.keyListener

      expect(mockAddListener).toHaveBeenCalledWith(newListener);
    });
  });

  describe("teardown", () => {
    test("removes listener and destroys server", () => {
      let mockRemoveListener = jest.fn()
      let mockKill = jest.fn()

      GlobalKeyboardListener.mockImplementation(() => {
        return {
          addListener: jest.fn(),
          removeListener: mockRemoveListener,
          kill: mockKill
        }
      });

      const sok = new HotkeyReplayDetector({ logger: mockLogger });
      sok.initialize(defaults);

      sok.teardown();

      expect(mockRemoveListener).toHaveBeenCalledWith(expect.any(Function))
      expect(mockKill).toHaveBeenCalled();
    });
  })
});