var mockLogger;

const fsExtra = require('fs-extra');
jest.mock('fs-extra');

const path = require('path');

const ReplayMover = require('./extension')

describe("extension", () => {

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn()
    }
  });

  describe("initialize", () => {
    test("stores destination", () => {
      const rm = new ReplayMover({ logger: mockLogger });
      const fakeSettings = {
        destination: 'destinationDir'
      }
      rm.initialize(fakeSettings);

      expect(rm.destination).toBe('destinationDir')
    });
  });

  describe('notifyModifyApply', () => {
    test("stores new destination", () => {
      const rm = new ReplayMover({ logger: mockLogger });
      const fakeSettings = {
        destination: 'destinationDir'
      }
      rm.initialize(fakeSettings);

      rm.notifyModifyApply({ destination: 'newLocation' })

      expect(rm.destination).toBe('newLocation')
    });
  });

  describe("on upload", () => {

    beforeEach(() => {
      fsExtra.moveSync = jest.fn()
    });

    test("moves replay to folder", () => {
      const rm = new ReplayMover({ logger: mockLogger });
      const fakeSettings = {
        destination: path.join('parentDir', 'destinationDir', 'replays')
      }
      rm.initialize(fakeSettings);

      const fakeReplay = {
        filePath: 'anotherDir/fake.mp4',
        fileName: 'fake.mp4'
      }

      rm.upload(fakeReplay)

      // use path to ensure platform separator
      const expectedDestination = path.join('parentDir', 'destinationDir', 'replays', 'fake.mp4')
      expect(fsExtra.moveSync).toHaveBeenCalledWith('anotherDir/fake.mp4', expectedDestination);
    });

    test("does nothing when destination missing", () => {
      const rm = new ReplayMover({ logger: mockLogger });
      rm.initialize({});

      const fakeReplay = {
        filePath: 'anotherDir/fake.mp4',
        fileName: 'fake.mp4'
      }

      rm.upload(fakeReplay)

      expect(fsExtra.moveSync).not.toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
