const fs = require('fs');
const path = require('path');


/**
 * Gorified map that keeps track of the replay files + names to rename
 */
export class ReplaySaver {

  constructor() {
    this.replayMap = new Map();
  }

  storeReplay(replayData) {
    console.log('storing', replayData);
    this.replayMap.set(replayData.replayUuid, replayData);
  }

  setTitle(titleData) {
    console.log('setting ', titleData);
    const entry = this.replayMap.get(titleData.replayUuid);
    console.log('found ', entry);
    var finalTitle = titleData.prefix + " " + titleData.title;
    finalTitle = finalTitle.trim();
    entry.title = finalTitle;

    const extension = path.extname(entry.filePath);
    const newFilePath = path.join(path.dirname(entry.filePath), entry.title + extension)
    fs.renameSync(
      entry.filePath,
      newFilePath
    );
    entry.filePath = newFilePath;
  }

  getReplayData(replayUuid) {
    return this.replayMap.get(replayUuid);
  }
}