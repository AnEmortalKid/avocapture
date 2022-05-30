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
const globalKeyboardListener = new GlobalKeyboardListener({
  windows: {
    onError: (errorCode) => console.error("[gkl] ERROR: " + errorCode),
    onInfo: (info) => console.info("[gkl] INFO: " + info),
    // TODO fix this pathing
    serverPath: path.join(__dirname, "../../node_modules/node-global-key-listener/bin/WinKeyServer.exe")
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

export class HotkeyReplayDetector extends ReplayDetector {

  initialize(hotkeySettings) {
    console.log('[hrd init] ', hotkeySettings);
    return;
  }

  pause() {
    // on modify, remove the listener to avoid global conflicts
    console.log('pausing');
    globalKeyboardListener.removeListener(this.keyListener);
    console.log('removed');
  }

  unpause() {
    // readd listener 
    console.log('unpausing');
    globalKeyboardListener.addListener(this.keyListener);
  }

  register(listener) {
    console.log('registering listeners');
    this.listener = listener;

    // do nothing atm
    this.keyListener = this.createKeyListener(this.listener);
    globalKeyboardListener.addListener(this.keyListener);
  }

  createKeyListener(listener) {
    return (e, down) => {
      console.log(`${e.name} [${e.rawKey._nameRaw}] [${e.vKey}]`)
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
  }

  teardown() {
    globalKeyboardListener.removeListener(this.keyListener);
    globalKeyboardListener.kill();
  }
}