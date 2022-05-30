
import { v4 as uuidv4 } from 'uuid';

export class ReplayDetectionListener {

  constructor(replayDialog) {
    console.log('initializing');
    this.replayDialog = replayDialog;
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
    const passData = {
      prefix: this.prefix,
      replayUuid: uuidv4(),
      ...replayData
    }


    // TO abstract away the filepath etc

    // create modal, get entry data
    this.replayDialog.create(passData);
  }
}