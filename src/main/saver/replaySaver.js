const fs = require('fs');
const path = require('path');


function log(msg) {
  console.log('[ReplaySaver] ', msg);
}

/**
 * Gorified map that keeps track of the replay files + names to rename
 */
export class ReplaySaver {

  constructor() {
    this.replayMap = new Map();
  }

  storeReplay(replayData) {
    log(`Storing replay ${replayData}`)
    this.replayMap.set(replayData.replayUuid, replayData);
  }

  setTitle(titleData) {
    const entry = this.replayMap.get(titleData.replayUuid);
    var finalTitle = titleData.prefix + " " + titleData.title;
    finalTitle = finalTitle.trim();
    log(`Setting replay title to ${finalTitle}`)
    entry.title = finalTitle;

    const extension = path.extname(entry.filePath);
    const newFilePath = path.join(path.dirname(entry.filePath), entry.title + extension)
    log(`Moving ${entry.filePath} to ${newFilePath}`)
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