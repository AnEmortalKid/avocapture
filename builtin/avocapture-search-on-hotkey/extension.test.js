var mockLogger;

const { GlobalKeyboardListener } = require("node-global-key-listener");
const HotkeyReplayDetector = require("./extension");
jest.mock('node-global-key-listener');

const fs = require('fs');
jest.mock('fs')

describe("extension", () => {

  let mockAddListener = jest.fn()
  let mockRemoveListener = jest.fn()
  let mockKill = jest.fn()



  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn()
    }

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
    "replayDirectory": "~/Videos",
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

    test("searches after delay", () => {
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

      // setup files search
      jest.readdirSync.mockReturnValue([]);

      // pretend a hotkey is pressed
      keyListener(event, false);

      jest.advanceTimersByTime(500);

      // TODO setup FS and shit

      // check fs
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