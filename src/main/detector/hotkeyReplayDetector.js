import { ReplayDetector } from './replayDetector'
const path = require('path')
const fs = require('fs');

// TODO dir config
const os = require("os");
const userHomeDir = os.homedir();

const isProduction = process.env.NODE_ENV === "production";
const windowsOptions = isProduction ? { serverPath: path.join(__dirname, "node_modules/node-global-key-listener/bin/WinKeyServer.exe") } : {};

console.log("DIR: ", __dirname)
import { GlobalKeyboardListener } from "node-global-key-listener";
const v = new GlobalKeyboardListener({
  windows: {
    onError: (errorCode) => console.error("ERROR: " + errorCode),
    onInfo: (info) => console.info("INFO: " + info),
    // TODO fix this pathing
    serverPath: path.join(__dirname, "../../node_modules/node-global-key-listener/bin/WinKeyServer.exe")
  },
  mac: {
    onError: (errorCode) => console.error("ERROR: " + errorCode),
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
  //passsing directoryPath and callback function
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

export class HotkeyReplayDetector extends ReplayDetector {
  initialize() {
    return;
  }

  register(listener) {
    console.log('registering listeners');

    // do nothing atm
    this.keyListener = (e, down) => {
      // TODO hotkey config
      if (e.state == "DOWN" && e.name == "NUMPAD DOT") {

        // TODO timeout configurable depending on replay save speed
        setTimeout(() => {
          const last = findLastReplay();
          listener.detected({ fileName: last.name, filePath: last.path });
        }, 500);
      }
      // TODO FOR TEST ONLY
      if (e.state == "DOWN" && e.name == "NUMPAD DIVIDE") {

        // TODO timeout configurable depending on replay save speed
        const last = findLastReplay();
        listener.detected({ fileName: last.name, filePath: last.path });
      }
    };

    v.addListener(this.keyListener);
  }

  teardown() {
    // globalShortcut.unregisterAll();
    v.removeListener(this.keyListener);
  }
}