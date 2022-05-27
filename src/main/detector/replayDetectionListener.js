export class ReplayDetectionListener {

  constructor(entryView) {
    console.log('initializing');
    this.entryView = entryView;
  }

  detected(fileName) {
    console.log('detected ', fileName)

    this.entryView.create();
  }
}