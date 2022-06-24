
import { v4 as uuidv4 } from 'uuid';
import Logger from '../logger/logger';

const logger = new Logger('ReplayDetectionListener');

export class ReplayDetectionListener {

  constructor(replayDialog, replaySaver) {
    logger.log('Initializing');
    this.replayDialog = replayDialog;
    this.replaySaver = replaySaver;
  }

  setPrefix(prefix) {
    this.prefix = prefix;
  }

  /**
   * Notifies this listener that a replay was detected
   * @param {object} a replay data containing a fileName and filePath for the replay
   */
  detected(replayData) {
    const replayUuid = uuidv4();

    this.replaySaver.storeReplay({
      replayUuid: replayUuid,
      ...replayData
    })

    // create modal, get user input
    this.replayDialog.show({
      prefix: this.prefix,
      replayUuid: replayUuid
    });

  }
}