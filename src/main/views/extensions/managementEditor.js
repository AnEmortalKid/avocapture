const { ipcRenderer } = require('electron');

console.log('Manager loaded');

ipcRenderer.on('ExtensionManagement.Initialize', (event, data) => {
  console.log(data);
});