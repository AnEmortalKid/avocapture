import Logger from '../logger/logger';

const fs = require('fs');
const path = require('path');

const logger = new Logger("ReplaySaver");

/**
 * Gorified map that keeps track of the replay files + names to rename
 */
export class ReplaySaver {

  constructor() {
    this.replayMap = new Map();
  }

  storeReplay(replayData) {
    logger.log(`Storing replay ${JSON.stringify(replayData)}`)
    this.replayMap.set(replayData.replayUuid, replayData);
  }

  setTitle(titleData) {
    const entry = this.replayMap.get(titleData.replayUuid);
    var finalTitle = titleData.prefix + " " + titleData.title;
    finalTitle = finalTitle.trim();
    logger.log(`Setting replay title to ${finalTitle}`)
    entry.title = finalTitle;

    const extension = path.extname(entry.filePath);
    const newFilePath = path.join(path.dirname(entry.filePath), entry.title + extension)
    logger.log(`Moving ${entry.filePath} to ${newFilePath}`)
    fs.renameSync(
      entry.filePath,
      newFilePath
    );
    entry.filePath = newFilePath;
    entry.fileName = entry.title + extension;
  }

  getReplayData(replayUuid) {
    return this.replayMap.get(replayUuid);
  }
}