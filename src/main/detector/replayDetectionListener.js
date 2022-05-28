
const { desktopCapturer } = require('electron')
export class ReplayDetectionListener {

  constructor(entryView, notifyCb) {
    console.log('initializing');
    this.entryView = entryView;
    this.notifyCb = notifyCb;
  }

  detected(fileName) {
    console.log('detected ', fileName)

    desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
      for (const source of sources) {
        console.log(source.name, "-", source.id);
      }
      return
    });

    // create modal, get entry data
    this.entryView.create();

    // data
    this.notifyCb({ file: fileName, entry: "foo" })
  }
}