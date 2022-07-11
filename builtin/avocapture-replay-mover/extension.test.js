var mockLogger;

const fs = require('fs');
jest.mock('fs');

const path = require('path');

const ReplayMover = require('./extension')

describe("extension", () => {

  beforeEach(() => {
    mockLogger = {
      info: jest.fn()
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
      expect(fs.renameSync).toHaveBeenCalledWith('anotherDir/fake.mp4', expectedDestination);
    });
  });
});
