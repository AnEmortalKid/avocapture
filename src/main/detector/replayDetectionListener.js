
import { v4 as uuidv4 } from 'uuid';

export class ReplayDetectionListener {

  constructor(replayDialog, replaySaver) {
    console.log('initializing');
    this.replayDialog = replayDialog;
    this.replaySaver = replaySaver;
  }

  setPrefix(prefix) {
    this.prefix = prefix;
  }

  /**
   * 
   * @param {object} replayData
   */
  detected(replayData) {
    // TODO capture ID and then request ID name from the editor
    // notify main of captured
    const replayUuid = uuidv4();

    this.replaySaver.storeReplay({
      replayUuid: replayUuid,
      ...replayData
    })


    // TO abstract away the filepath etc

    // create modal, get entry data
    this.replayDialog.create({
      prefix: this.prefix,
      replayUuid: replayUuid
    });

  }
}