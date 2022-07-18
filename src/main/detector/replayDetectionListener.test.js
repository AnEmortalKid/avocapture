jest.mock('uuid', () => {

  return {
    v4: jest.fn().mockImplementation(() => {
      return "someUUID"
    })
  }
});

import { ReplayDetectionListener } from "./replayDetectionListener";

let mockReplayDialog = {
  show: jest.fn()
}

let mockReplaySaver = {
  storeReplay: jest.fn()
}

describe('ReplayDetectionListener', () => {

  afterEach(() => {
    jest.clearAllMocks();
  })

  test('detected stores replay', () => {
    const rdl = new ReplayDetectionListener(mockReplayDialog, mockReplaySaver);

    rdl.detected({
      fileName: "replay.mp4",
      filePath: "replays/replay.mp4"
    });

    expect(mockReplayDialog.show).toHaveBeenCalled();
    expect(mockReplaySaver.storeReplay).toHaveBeenCalledWith({
      replayUuid: "someUUID",
      fileName: "replay.mp4",
      filePath: "replays/replay.mp4"
    });
  });

  test("stores replay with prefix set", () => {
    const rdl = new ReplayDetectionListener(mockReplayDialog, mockReplaySaver);
    rdl.setPrefix("somePrefix");

    rdl.detected({
      fileName: "replay.mp4",
      filePath: "replays/replay.mp4"
    });

    expect(mockReplaySaver.storeReplay).toHaveBeenCalled()
    expect(mockReplayDialog.show).toHaveBeenCalledWith({
      prefix: "somePrefix",
      replayUuid: "someUUID",
      replayName: "replay"
    });
  });
});