import { ReplayDetectorExtension } from './replayDetectorExtension'
const path = require('path')
const fs = require('fs');

// TODO dir config
const os = require("os");
const userHomeDir = os.homedir();

const isProduction = process.env.NODE_ENV === "production";
const windowsOptions = isProduction ?
  { serverPath: path.join(__dirname, "../../node_modules/node-global-key-listener/bin/WinKeyServer.exe") } :
  { serverPath: path.join(__dirname, "../../node_modules/node-global-key-listener/bin/WinKeyServer.exe") };

console.log("DIR: ", __dirname)
import { GlobalKeyboardListener } from "node-global-key-listener";
const globalKeyboardListener = new GlobalKeyboardListener({
  windows: {
    onError: (errorCode) => console.error("[gkl] ERROR: " + errorCode),
    onInfo: (info) => console.info("[gkl] INFO: " + info),
    ...windowsOptions
  },
  mac: {
    onError: (errorCode) => console.error("[gkl] ERROR: " + errorCode),
  }
}
);


function getLastCreated(a, b) {
  if (a.created < b.created) {
    return b;
  }
  return a;
}

function findLastReplay() {
  const directoryPath = path.join(userHomeDir, 'Videos');
  const files = fs.readdirSync(directoryPath);

  var latest;
  for (var file of files) {
    var fullPath = path.join(directoryPath, file)
    var stat = fs.lstatSync(fullPath, { bigint: true });
    if (stat.isDirectory()) {
      continue;
    }

    const curr = { path: fullPath, name: file, created: stat.ctimeMs };
    if (!latest) {
      latest = curr
    }
    else {
      // compare
      latest = getLastCreated(latest, curr);
    }
  }

  return latest;
}

export class HotkeyReplayDetector extends ReplayDetectorExtension {

  initialize(hotkeySettings) {
    console.log('[hrd init] ', hotkeySettings);
    this.keyListener = this.createKeyListener(hotkeySettings);
    return;
  }

  notifyModifying() {
    // remove current listener to avoid collisions
    globalKeyboardListener.removeListener(this.keyListener);
  }

  notifyModifyApply(newSettings) {
    this.keyListener = this.createKeyListener(newSettings).bind(this);
    globalKeyboardListener.addListener(this.keyListener);
  }

  notifyModifyCancel() {
    // re-add old listener
    globalKeyboardListener.addListener(this.keyListener);
  }

  teardown() {
    globalKeyboardListener.removeListener(this.keyListener);
    globalKeyboardListener.kill();
  }

  register(detectListener) {
    console.log('registering listeners');
    this.detectListener = detectListener;

    // rebind this now that the detectListener is passed to us
    this.keyListener = this.keyListener.bind(this);
    globalKeyboardListener.addListener(this.keyListener);
  }

  createKeyListener(settings) {
    return (e, down) => {
      // TODO hotkey config
      if (e.state == "DOWN" && e.name == "NUMPAD DOT") {

        // TODO timeout configurable depending on replay save speed
        setTimeout(() => {
          const last = findLastReplay();
          this.detectListener.detected({ fileName: last.name, filePath: last.path });
        }, 500);
      }
      // TODO FOR TEST ONLY
      if (e.state == "DOWN" && e.name == "NUMPAD DIVIDE") {

        // TODO timeout configurable depending on replay save speed
        const last = findLastReplay();
        this.detectListener.detected({ fileName: last.name, filePath: last.path });
      }
      if (e.state == "DOWN" && e.vKey == settings.vKey) {
        console.log('What we wanted!');
      }
    };
  }


}