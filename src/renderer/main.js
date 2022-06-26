console.log(
  '👋 This message is being logged by "renderer.js", included via webpack'
);

const ipcRenderer = window.require('electron').ipcRenderer;
const prefixInput = document.getElementById("app.prefix");
const detectorSelection = document.getElementById("detector.name");
const detectorSettings = document.getElementById("detector.settings");
const uploaderSelection = document.getElementById("uploader.name");
const uploaderSettings = document.getElementById("uploader.settings");

function logOn(name, data) {
  console.log(`Received [${name}]`, data);
}

function addInitializeSettingsClickListener(button, select) {
  button.onclick = () => {
    const selected = select.options[select.selectedIndex];
    const name = selected.dataset.extensionName;
    // only append to send if we have data
    if (name) {
      ipcRenderer.send("ExtensionSettings.Edit", { extensionName: name });
    }
  };
}

addInitializeSettingsClickListener(detectorSettings, detectorSelection);
addInitializeSettingsClickListener(uploaderSettings, uploaderSelection);

function createSelectOption(extensionName, displayName) {
  /* <option value="hotkey" data-extension-name="hotkey-detector">Second</option> */
  const opt = document.createElement('option');
  opt.dataset.extensionName = extensionName;
  opt.value = displayName;
  opt.text = displayName;
  return opt;
}

function createNoneOption() {
  const opt = document.createElement('option');
  opt.selected = true;
  opt.text = "None";
  return opt;
}

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function addDetectors(settings) {
  removeAllChildNodes(detectorSelection);
  detectorSelection.appendChild(createNoneOption());

  const selectedDetector = settings.extensions?.selected?.detector;
  for (var detectorOption of settings.detectors) {
    const option = createSelectOption(detectorOption.extensionName, detectorOption.displayName);
    detectorSelection.appendChild(option);
    if (selectedDetector == detectorOption.extensionName) {
      option.selected = true;
    }
  }
}

function addUploaders(settings) {
  removeAllChildNodes(uploaderSelection);
  uploaderSelection.appendChild(createNoneOption());

  const selectedUploader = settings.extensions?.selected?.uploader;
  for (var uploaderOption of settings.uploaders) {
    const option = createSelectOption(uploaderOption.extensionName, uploaderOption.displayName);
    uploaderSelection.appendChild(option);
    if (selectedUploader == uploaderOption.extensionName) {
      option.selected = true;
    }
  }
}

function bindToUI(settings) {
  prefixInput.value = settings.prefix;

  addDetectors(settings);
  addUploaders(settings);
}

function addChangeListener(type, selection) {
  selection.addEventListener('change', () => {
    const selected = selection.options[selection.selectedIndex];
    const name = selected.dataset.extensionName;
    ipcRenderer.send('AppSettings.Extension.Select', { type: type, name: name });
  });
}

prefixInput.addEventListener('change', (event) => {
  ipcRenderer.send('AppSettings.Apply.Prefix', event.target.value);
});
addChangeListener('detector', detectorSelection);
addChangeListener('uploader', uploaderSelection);

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