var mockLogger;

const EventEmitter = require('events')

const ObsWebSocket = require('obs-websocket-js');
jest.mock('obs-websocket-js');

const ObsEventDetector = require('./extension')

function createSuccessPromise() {
  return new Promise((resolve, reject) => {
    resolve({ msg: "hello" });
  })
}

function createFailurePromise() {
  return new Promise((resolve, reject) => {
    reject(
      {
        error: {
          code: 100, message: "not available"
        }
      });
  })
}

describe("extension", () => {

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn()
    }

    ObsWebSocket.default.mockImplementation(() => {
      return {
        connect: jest.fn().mockImplementation(createSuccessPromise)
      }
    });

    jest.useFakeTimers();
    jest.spyOn(global, 'setInterval');
    jest.spyOn(global, 'clearInterval');
  });

  describe('connection handling', () => {

    test("sets listeners on connect", async () => {
      let mockOn = jest.fn()

      ObsWebSocket.default.mockImplementation(() => {
        return {
          connect: jest.fn().mockImplementation(createSuccessPromise),
          on: mockOn
        }
      });

      const od = new ObsEventDetector({ logger: mockLogger });
      od.initialize({
        serverPort: 4444,
        reconnectIntervalSeconds: 1
      });

      // advance poller
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      expect(mockOn).toHaveBeenCalledWith('ReplayBufferSaved', expect.any(Function));
      expect(mockOn).toHaveBeenCalledWith('ExitStarted', expect.any(Function));

      // removes poller
      expect(clearInterval).toHaveBeenCalledTimes(1);
    });

    test("attempts to reconnect on an interval", async () => {
      let mockConnection = jest.fn().mockImplementationOnce(
        createFailurePromise)
        .mockImplementationOnce(
          createFailurePromise
        ).mockImplementationOnce(
          createSuccessPromise
        );

      ObsWebSocket.default.mockImplementation(() => {
        return {
          connect: mockConnection
        }
      });

      const od = new ObsEventDetector({ logger: mockLogger });
      od.initialize({
        serverPort: 4444,
        reconnectIntervalSeconds: 1
      });

      expect(setInterval).toHaveBeenCalledTimes(1);
      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 1000);

      // first error
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
      // 2nd error
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
      // success connect
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      expect(clearInterval).toHaveBeenCalledTimes(1);
    });
  });

  describe('event listeners', () => {

    test('ReplayBufferSaved notifies detector', async () => {
      const emitter = new EventEmitter();

      ObsWebSocket.default.mockImplementation(() => {
        return {
          connect: jest.fn().mockImplementation(createSuccessPromise),
          on: (name, cb) => emitter.on(name, cb)
        }
      });

      // connect successfully
      const od = new ObsEventDetector({ logger: mockLogger });
      od.initialize({
        serverPort: 4444,
        reconnectIntervalSeconds: 1
      });
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      const detectionListener = {
        detected: jest.fn()
      };
      od.register(detectionListener);

      emitter.emit('ReplayBufferSaved', { savedReplayPath: 'someDir/replayCapture.mp4' });


      expect(detectionListener.detected).toHaveBeenCalledWith({
        filePath: 'someDir/replayCapture.mp4',
        fileName: 'replayCapture.mp4'
      });
    });

    test('ExitStarted cleans up and re-polls', async () => {
      const emitter = new EventEmitter();

      let mockOff = jest.fn()

      ObsWebSocket.default.mockImplementation(() => {
        return {
          connect: jest.fn().mockImplementation(createSuccessPromise),
          on: (name, cb) => emitter.on(name, cb),
          off: mockOff
        }
      });

      // connect successfully
      const od = new ObsEventDetector({ logger: mockLogger });
      od.initialize({
        serverPort: 4444,
        reconnectIntervalSeconds: 1
      });
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      emitter.emit('ExitStarted');

      // removes listeners
      expect(mockOff).toHaveBeenCalledTimes(2);
      expect(mockOff).toHaveBeenCalledWith('ExitStarted');
      expect(mockOff).toHaveBeenCalledWith('ReplayBufferSaved');

      // it should restart the interval after exiting
      expect(setInterval).toHaveBeenCalledTimes(2);
      jest.clearAllTimers();
    });
  });


  describe('notifyModifyApply', () => {

    test('updates settings and disconnects when already connected', async () => {
      let mockOff = jest.fn()
      let mockDisconnect = jest.fn()

      ObsWebSocket.default.mockImplementation(() => {
        return {
          connect: jest.fn().mockImplementation(createSuccessPromise),
          off: mockOff,
          disconnect: mockDisconnect
        }
      });

      // connect successfully
      const od = new ObsEventDetector({ logger: mockLogger });
      od.initialize({
        serverPort: 4444,
        reconnectIntervalSeconds: 1
      });
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      od.notifyModifyApply({
        serverPort: 4444,
        reconnectIntervalSeconds: 1
      });

      // removes listeners and disconnects
      expect(mockOff).toHaveBeenCalledTimes(2);
      expect(mockDisconnect).toHaveBeenCalled();

      // restarts polling (1 initial, 1 now)
      expect(setInterval).toHaveBeenCalledTimes(2);
      jest.clearAllTimers();
    });

    test('restarts poller when not connected', async () => {
      let mockOff = jest.fn()
      let mockDisconnect = jest.fn()

      ObsWebSocket.default.mockImplementation(() => {
        return {
          connect: jest.fn().mockImplementation(createFailurePromise),
          off: mockOff,
          disconnect: mockDisconnect
        }
      });

      const od = new ObsEventDetector({ logger: mockLogger });
      od.initialize({
        serverPort: 4444,
        reconnectIntervalSeconds: 1
      });
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      od.notifyModifyApply({
        serverPort: 4444,
        reconnectIntervalSeconds: 2
      });

      // restarts polling (1 initial, 1 now)
      expect(clearInterval).toHaveBeenCalledTimes(1);
      expect(setInterval).toHaveBeenCalledTimes(2);
      // uses updated interval
      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 2000);
    });
  });



  describe('teardown', () => {

    test('removes listeners and disconnects', async () => {
      let mockOff = jest.fn()
      let mockDisconnect = jest.fn()

      ObsWebSocket.default.mockImplementation(() => {
        return {
          connect: jest.fn().mockImplementation(createSuccessPromise),
          off: mockOff,
          disconnect: mockDisconnect
        }
      });

      // connect successfully
      const od = new ObsEventDetector({ logger: mockLogger });
      od.initialize({
        serverPort: 4444,
        reconnectIntervalSeconds: 1
      });
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      od.teardown();

      // removes listeners
      expect(mockOff).toHaveBeenCalledTimes(2);
      expect(mockOff).toHaveBeenCalledWith('ExitStarted');
      expect(mockOff).toHaveBeenCalledWith('ReplayBufferSaved')

      // disconnects
      expect(mockDisconnect).toHaveBeenCalled();
    });

    test('stops polling when not connected', async () => {
      ObsWebSocket.default.mockImplementation(() => {
        return {
          connect: jest.fn().mockImplementation(createFailurePromise),
        }
      });

      const od = new ObsEventDetector({ logger: mockLogger });
      od.initialize({
        serverPort: 4444,
        reconnectIntervalSeconds: 1
      });
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      od.teardown();

      // removes poller
      expect(clearInterval).toHaveBeenCalledTimes(1);
    });
  });

});