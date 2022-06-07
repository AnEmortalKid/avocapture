console.log(
  '👋 This message is being logged by "renderer.js", included via webpack'
);


const ipcRenderer = window.require('electron').ipcRenderer;
const prefixInput = document.getElementById("app.prefix");
const detectorSelection = document.getElementById("detector.name");
const uploaderSelection = document.getElementById("uploader.name");

function logOn(name, data) {
  console.log(`Received [${name}]`, data);
}

document.getElementById("detector.settings").onclick = () => {
  const selected = detectorSelection.options[detectorSelection.selectedIndex];
  const name = selected.dataset.pluginName;
  ipcRenderer.send("PluginSettings.Initialize", { pluginName: name });
}

function bindToUI(settings) {
  prefixInput.value = settings.prefix;

  prefixInput.addEventListener('change', (event) => {
    ipcRenderer.send('AppSettings.Apply.Prefix', event.target.value);
  });
}

detectorSelection.addEventListener('change', () => {
  const selected = detectorSelection.options[detectorSelection.selectedIndex];
  const name = selected.dataset.pluginName;
  ipcRenderer.send('AppSettings.Extension.Select', { detector: name });
});

ipcRenderer.on("ReplayDetails.Add", (event, data) => {
  logOn("ReplayDetails.Add", data);

  const item = document.createElement("li");
  item.textContent = data.title
  document.getElementById("replays.list").appendChild(item);
});

ipcRenderer.on("AppSettings.Initialize", (event, data) => {
  logOn('AppSettings.Initialize ', data)
  bindToUI(data);
});