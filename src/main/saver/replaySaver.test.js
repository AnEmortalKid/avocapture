import Logger from "../logger/logger";
jest.mock("../logger/logger");

const fs = require("fs");
jest.mock("fs");

const path = require("path");

import { ReplaySaver } from "./replaySaver";

describe("ReplaySaver", () => {
  test("stores and retrieves", () => {
    const rd = new ReplaySaver();

    rd.storeReplay({ replayUuid: "someUuid", filePath: "replays/rep1.mp4" });

    expect(rd.getReplayData("someUuid")).toEqual({
      replayUuid: "someUuid",
      filePath: "replays/rep1.mp4",
    });
  });

  test("renames replay", () => {
    fs.renameSync = jest.fn();

    const rd = new ReplaySaver();

    rd.storeReplay({ replayUuid: "renameable", filePath: "replays/rep1.mp4" });

    rd.setTitle({
      replayUuid: "renameable",
      prefix: "thePrefix",
      title: "myTitle",
    });

    expect(fs.renameSync).toHaveBeenCalledWith(
      "replays/rep1.mp4",
      path.join("replays", "thePrefix myTitle" + ".mp4")
    );
  });
});
