jest.useFakeTimers('modern');
jest.spyOn(global, 'setInterval');
jest.spyOn(global, 'clearInterval');

var mockLogger;

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
        connect: () => new Promise((resolve, reject) => {
          process.nextTick(resolve({ msg: "hello" }));
        })
      }
    });

    // fakeSocket = socketFactory();
    // ObsWebSocket.default = function () {
    //   return fakeSocket;
    // };
  });

  describe('connection handling', () => {

    // todo advance a few times
    test("attempts to reconnect on an interval", async () => {
      let mockConnection = jest.fn().mockImplementationOnce(
        createFailurePromise)
        .mockImplementationOnce(
          createFailurePromise
        ).mockImplementationOnce(
          createSuccessPromise
        )

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

  // connect fail -> keep retrying
  // connect success -> sets up listeners

  // listener ReplayBuffer -> calls detector
  // listener ExitStarted -> disconnects

  // test poll interval
  // mock timers: https://jestjs.io/docs/timer-mocks

  test("does the thing", async () => {
    const od = new ObsEventDetector({ logger: mockLogger });
    od.initialize({
      serverPort: 4444
    });

  }, 100000);
})