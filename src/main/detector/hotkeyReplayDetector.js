import { ReplayDetector } from './replayDetector'
const path = require('path')

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

export class HotkeyReplayDetector extends ReplayDetector {
  initialize() {
    return;
  }

  register(listener) {
    console.log('registering listeners');

    // do nothing atm
    this.keyListener = (e, down) => {
      if (e.state == "DOWN" && e.name == "NUMPAD DIVIDE") {
        listener.detected("From NodeGlobal");
      }
    };

    v.addListener(this.keyListener);
  }

  teardown() {
    // globalShortcut.unregisterAll();
    v.removeListener(this.keyListener);
  }
}