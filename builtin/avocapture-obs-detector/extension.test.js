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
  let mockConnect;
  let mockOn;
  let mockOff;
  let mockDisconnect;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn()
    }

    mockConnect = jest.fn();
    mockConnect.mockImplementation(createSuccessPromise);
    mockOff = jest.fn();
    mockOn = jest.fn();
    mockDisconnect = jest.fn()
    ObsWebSocket.default.mockImplementation(() => {
      return {
        connect: mockConnect,
        on: mockOn,
        off: mockOff,
        disconnect: mockDisconnect
      }
    });

    jest.useFakeTimers();
    jest.spyOn(global, 'setInterval');
    jest.spyOn(global, 'clearInterval');
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('connection handling', () => {

    test("sets listeners on connect", async () => {
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

    test("uses default interval when not provided", async () => {
      const od = new ObsEventDetector({ logger: mockLogger });
      od.initialize({
        serverPort: 4444
      });

      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 3000);
    });

    test("attempts to reconnect on an interval", async () => {
      mockConnect.mockImplementationOnce(
        createFailurePromise)
        .mockImplementationOnce(
          createFailurePromise
        ).mockImplementationOnce(
          createSuccessPromise
        );

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

    test('re initialize when disconnected creates new interval', async () => {
      mockConnect.mockImplementation(createFailurePromise);

      const od = new ObsEventDetector({ logger: mockLogger });
      od.initialize({
        serverPort: 4444,
        reconnectIntervalSeconds: 1
      });
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      od.initialize({
        serverPort: 4444,
        reconnectIntervalSeconds: 2
      });

      // restarts polling (1 initial, 1 now)
      expect(setInterval).toHaveBeenCalledTimes(2);
      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 2000);
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
    });
  });


  describe('notifyModifyApply', () => {

    test('updates settings and disconnects when already connected', async () => {
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
    });

    test('restarts poller when not connected', async () => {
      mockConnect.mockImplementation(createFailurePromise);

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
      mockConnect.mockImplementation(createFailurePromise);

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