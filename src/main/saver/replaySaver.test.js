
import { logCleaner } from '../logger/logCleaner'
jest.mock('../logger/logCleaner');

import Logger from '../logger/logger';
jest.mock('../logger/logger');

// TODO user mocks
// TODO mock Logger

import { ReplaySaver } from './replaySaver'

describe("ReplaySaver", () => {

  test("stores and retrieves", () => {
    const rd = new ReplaySaver();

    rd.storeReplay({ replayUuid: 'someUuid', filePath: 'replays/rep1.mp4' });

    expect(rd.getReplayData('someUuid')).not.toBeNull();
  });

});