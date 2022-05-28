
const { desktopCapturer } = require('electron')
export class ReplayDetectionListener {

  constructor(entryView) {
    console.log('initializing');
    this.entryView = entryView;
  }

  detected(fileName) {
    console.log('detected ', fileName)

    // desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
    //   for (const source of sources) {
    //     console.log(source.name, "-", source.id);
    //   }
    //   return
    // });

    // create modal, get entry data
    this.entryView.create({ id: fileName, prefix: "notified" });
  }
}