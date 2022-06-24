const path = require('path')
const fs = require('fs');
const { GlobalKeyboardListener } = require('node-global-key-listener');

const windowsOptions = { serverPath: path.join(__dirname, "./node_modules/node-global-key-listener/bin/WinKeyServer.exe") }
const globalKeyboardListener = new GlobalKeyboardListener({
  windows: {
    onError: (errorCode) => console.error("[avocapture.search-on-hotkey] [gkl] ERROR: " + errorCode),
    onInfo: (info) => console.info("[avocapture.search-on-hotkey] [gkl] INFO: " + info),
    ...windowsOptions
  },
  mac: {
    onError: (errorCode) => console.error("[avocapture.search-on-hotkey] [gkl] ERROR: " + errorCode),
  }
}
);


function log(msg) {
  console.log('[avocapture.search-on-hotkey] ', msg)
}

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

class HotkeyReplayDetector {

  initialize(hotkeySettings) {
    log(`initialize ${JSON.stringify(hotkeySettings)}`);
    this.settings = hotkeySettings;
    this.keyListener = this.createKeyListener(hotkeySettings);
    return;
  }

  notifyModifying() {
    // remove current listener to avoid collisions
    globalKeyboardListener.removeListener(this.keyListener);
  }

  notifyModifyApply(newSettings) {
    log(`modify ${JSON.stringify(newSettings)}`);
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
    log('register');
    this.detectListener = detectListener;

    // rebind this now that the detectListener is passed to us
    this.keyListener = this.keyListener.bind(this);
    globalKeyboardListener.addListener(this.keyListener);
  }

  createKeyListener(settings) {
    return (e, down) => {
      if (e.state == "DOWN" && e.vKey == settings.vKey) {
        setTimeout(() => {
          const last = findLastReplay(this.settings.replayDirectory);
          this.detectListener.detected({ fileName: last.name, filePath: last.path });
        }, settings.hotkeyDelayMS);
      }
    };
  }
}

module.exports = HotkeyReplayDetector
