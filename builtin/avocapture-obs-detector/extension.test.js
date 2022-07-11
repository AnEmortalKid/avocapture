var mockLogger;
var fakeSocket;

const ObsWebSocket = require('obs-websocket-js');
jest.mock('obs-websocket-js');

function socketFactory() {
  return {
    connect: jest.fn()
  }
}

const ObsEventDetector = require('./extension')

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

  }, 50000);
})