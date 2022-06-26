const { contextBridge, ipcRenderer } = require('electron')

console.log(
  '👋 Common preload'
);

const extensions = {
  applySettings(settings) {
    ipcRenderer.send("ExtensionSettings.Apply", { settings: settings });
  },

  cancelSettings() {
    ipcRenderer.send("ExtensionSettings.Cancel");
  },

  onInitialize(initCallback) {
    ipcRenderer.on('ExtensionSettings.Initialize', (event, data) => {
      initCallback(data);
    });
  }
}

const actions = {
  selectDirectory(responseCallback) {
    ipcRenderer.once('AppActions.SelectDirectory.Response', (event, data) => {
      if (data) {
        responseCallback(data);
      }
    });

    ipcRenderer.send('AppActions.SelectDirectory');
  }
}

const api = {
  extensions: extensions,
  actions: actions
}

contextBridge.exposeInMainWorld('avocapture', api);