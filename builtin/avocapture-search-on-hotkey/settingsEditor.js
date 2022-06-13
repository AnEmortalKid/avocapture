const { ipcRenderer } = require("electron");

console.log('Loaded settingsEditor');

const selectedHotkey = "hotkey.selected";
const replayFolder = "hotkey.replayLocation";
const hotkeyDelay = "hotkey.delayMS";

const extensionName = "avocapture-search-on-hotkey";

var nextHotkey = {
  vKey: '', browserName: ''
}

document.getElementById("hotkey.replayLocation.button").addEventListener('click', () => {
  ipcRenderer.send('select-directory', { replyMsg: "hotkey-dector.selected.directory" })
});

function bindToForm(data) {
  console.log('BindingToForm ', data);
  const input = document.getElementById(selectedHotkey);
  if (data) {
    const { vKey, browserName } = data;
    input.value = browserName;
    nextHotkey.vKey = vKey
    nextHotkey.browserName = browserName
  }

  input.addEventListener('keydown', e => {
    console.log(`${e} | ${e.code} | ${e.key} | ${e.keyCode}`);
    input.value = e.code;
    nextHotkey.browserName = e.code;
    nextHotkey.vKey = e.keyCode;
    e.preventDefault();
  });



  const delayInput = document.getElementById(hotkeyDelay);
  delayInput.value = data.hotkeyDelayMS

  const replayDirInput = document.getElementById(replayFolder);
  replayDirInput.value = data.replayDirectory;
}

function bindFromForm() {
  // TODO stash in the input?
  const input = document.getElementById(selectedHotkey);

  const delayInput = document.getElementById(hotkeyDelay);

  const replayDirInput = document.getElementById(replayFolder);
  return {
    vKey: nextHotkey.vKey,
    browserName: nextHotkey.browserName,
    hotkeyDelayMS: delayInput.value,
    replayDirectory: replayDirInput.value
  }
}

function bindButtons() {
  var applyBtn = document.getElementById("entry-apply-btn");
  applyBtn.addEventListener("click", submitData);

  var cancelBtn = document.getElementById("entry-cancel-btn");
  cancelBtn.addEventListener("click", cancelForm);
}

function submitData() {
  const data = bindFromForm();
  // TODO disable/don't apply if invalid
  ipcRenderer.send("ExtensionSettings.Apply", { extensionName: extensionName, settings: data });
}

function cancelForm() {
  ipcRenderer.send("ExtensionSettings.Cancel");
}

ipcRenderer.on("ExtensionSettings.Initialize." + extensionName, (event, data) => {
  console.log("Received ExtensionSettings.Initialize");
  console.log(JSON.stringify(data));
  bindToForm(data);
  bindButtons();
});

// TODO better name for this 
ipcRenderer.on('select-directory-response', (event, data) => {
  if (data) {
    document.getElementById(replayFolder).value = data;
  }
});