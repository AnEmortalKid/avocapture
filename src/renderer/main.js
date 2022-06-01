const ipcRenderer = window.require('electron').ipcRenderer;

const detectorSelection = document.getElementById("detector.name");
const uploaderSelection = document.getElementById("uploader.name");

console.log(
  '👋 This message is being logged by "renderer.js", included via webpack'
);

document.getElementById("detector.settings").onclick = () => {
  ipcRenderer.send("HotkeySettings.Initialize", {});
  const selected = detectorSelection.options[detectorSelection.selectedIndex];
  const name = selected.dataset.pluginName;
  ipcRenderer.send("PluginSettings.Initialize", { pluginName: name });
}

ipcRenderer.on("ReplayDetails.Add", (event, data) => {
  console.log("Received ReplayDetails.Add");
  console.log(JSON.stringify(data));

  const item = document.createElement("li");
  item.textContent = data.title
  document.getElementById("replays.list").appendChild(item);
});

ipcRenderer.on("AppSettings.Initialize", (event, data) => {
  console.log('[AppSettings.Initialize] ', data);
  const input = document.getElementById('app.prefix');
  input.value = data.prefix;

  input.addEventListener('change', (event) => {
    ipcRenderer.send('AppSettings.Apply', { prefix: event.target.value });
  });
});