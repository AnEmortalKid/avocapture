export class ReplayDetectionListener {

  constructor(entryView, notifyCb) {
    console.log('initializing');
    this.entryView = entryView;
    this.notifyCb = notifyCb;
  }

  detected(fileName) {
    console.log('detected ', fileName)

    // create modal, get entry data
    this.entryView.create();

    // data
    this.notifyCb({ file: fileName, entry: "foo" })
  }
}