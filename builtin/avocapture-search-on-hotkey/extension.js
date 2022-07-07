const path = require("path");
const fs = require("fs");
const { GlobalKeyboardListener } = require("node-global-key-listener");

const windowsOptions = {
  serverPath: path.join(
    __dirname,
    "./node_modules/node-global-key-listener/bin/WinKeyServer.exe"
  ),
};

function createGlobalListener(logger) {
  return new GlobalKeyboardListener({
    windows: {
      onError: (errorCode) =>
        logger.error("[globalKeyListener] got error: " + errorCode),
      onInfo: (info) =>
        logger.info("[globalKeyListener] " + info),
      ...windowsOptions,
    },
    mac: {
      onError: (errorCode) =>
        logger.error("[globalKeyListener] got error: " + errorCode),
    },
  });
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
    var fullPath = path.join(replayDirectory, file);
    var stat = fs.lstatSync(fullPath, { bigint: true });
    if (stat.isDirectory()) {
      continue;
    }

    const curr = { path: fullPath, name: file, created: stat.ctimeMs };
    if (!latest) {
      latest = curr;
    } else {
      // compare
      latest = getLastCreated(latest, curr);
    }
  }

  return latest;
}

class HotkeyReplayDetector {
  constructor(opts) {
    const { logger } = opts;
    this.logger = logger;

    if (!this.globalKeyboardListener) {
      this.globalKeyboardListener = createGlobalListener(this.logger);
    }

  }

  initialize(hotkeySettings) {
    this.logger.info(`initialize ${JSON.stringify(hotkeySettings)}`);
    this.settings = hotkeySettings;
    this.keyListener = this.createKeyListener(hotkeySettings);
    return;
  }

  notifyModifying() {
    // remove current listener to avoid collisions
    this.globalKeyboardListener.removeListener(this.keyListener);
  }

  notifyModifyApply(newSettings) {
    this.logger.info(`modify ${JSON.stringify(newSettings)}`);
    this.settings = newSettings;
    this.keyListener = this.createKeyListener(newSettings).bind(this);
    this.globalKeyboardListener.addListener(this.keyListener);
  }

  notifyModifyCancel() {
    // re-add old listener
    this.globalKeyboardListener.addListener(this.keyListener);
  }

  teardown() {
    this.globalKeyboardListener.removeListener(this.keyListener);
    this.globalKeyboardListener.kill();
  }

  register(detectListener) {
    this.logger.info('Registering detection listener.');
    this.detectListener = detectListener;

    // rebind this now that the detectListener is passed to us
    this.keyListener = this.keyListener.bind(this);
    this.globalKeyboardListener.addListener(this.keyListener);
  }

  createKeyListener(settings) {
    return (e, down) => {
      if (e.state == "DOWN" && e.vKey == settings.vKey) {
        setTimeout(() => {
          const last = findLastReplay(this.settings.replayDirectory);
          // mechanism that writes replays is not active, detect nothing.
          if (last) {
            this.detectListener.detected({
              fileName: last.name,
              filePath: last.path,
            });
          }
        }, settings.hotkeyDelayMS);
      }
    };
  }
}

module.exports = HotkeyReplayDetector;
