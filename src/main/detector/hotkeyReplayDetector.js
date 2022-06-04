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

function findLastReplay(replayDirectory) {
  const files = fs.readdirSync(replayDirectory);

  var latest;
  for (var file of files) {
    var fullPath = path.join(replayDirectory, file)
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

  name() {
    return "hotkey-detector";
  }

  initialize(hotkeySettings) {
    this.settings = hotkeySettings;
    this.keyListener = this.createKeyListener(hotkeySettings);
    return;
  }

  notifyModifying() {
    // remove current listener to avoid collisions
    globalKeyboardListener.removeListener(this.keyListener);
  }

  notifyModifyApply(newSettings) {
    this.settings = newSettings;
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
      if (e.state == "DOWN" && e.vKey == settings.vKey) {
        setTimeout(() => {
          // TODO fix this hardcoded directory and get the saved settings OR defaults
          const repDir = "C:\\Users\\Jan\\Videos";
          const last = findLastReplay(repDir);
          this.detectListener.detected({ fileName: last.name, filePath: last.path });
        }, settings.timeoutMS);
      }
    };
  }


}