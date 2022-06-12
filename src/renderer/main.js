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
  const name = selected.dataset.extensionName;
  ipcRenderer.send("ExtensionSettings.Initialize", { extensionName: name });
}

function createSelectOption(extensionName, displayName) {
  /* <option value="hotkey" data-extension-name="hotkey-detector">Second</option> */
  const opt = document.createElement('option');
  opt.dataset.extensionName = extensionName;
  opt.value = displayName;
  opt.text = displayName;
  return opt;
}

function addDetectors(settings) {
  const selectedDetector = settings.extensions?.selected?.detector;
  for (var detectorOption of settings.detectors) {
    const option = createSelectOption(detectorOption.extensionName, detectorOption.displayName);
    detectorSelection.appendChild(option);
    if (selectedDetector == detectorOption.extensionName) {
      option.selected = true;
    }
  }
}

function bindToUI(settings) {
  prefixInput.value = settings.prefix;

  prefixInput.addEventListener('change', (event) => {
    ipcRenderer.send('AppSettings.Apply.Prefix', event.target.value);
  });

  addDetectors(settings);

}

detectorSelection.addEventListener('change', () => {
  const selected = detectorSelection.options[detectorSelection.selectedIndex];
  const name = selected.dataset.extensionName;
  ipcRenderer.send('AppSettings.Extension.Select', { type: 'detector', name: name });
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