const { ipcRenderer } = require("electron");

const selectedHotkey = "hotkey.selected";

var nextHotkey = {
  vKey: '', browserName: ''
}

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
}

function broadcastModifying() {
  console.log('broadcastModifying');
  ipcRenderer.send("HotkeySettings.Modifying", {});
}

function bindFromForm() {
  // TODO stash in the input?
  const input = document.getElementById(selectedHotkey);
  return {
    vKey: nextHotkey.vKey,
    browserName: nextHotkey.browserName
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
  ipcRenderer.send("PluginSettings.Apply", { pluginName: 'hotkey-detector', data: data });
}

function cancelForm() {
  ipcRenderer.send("PluginSettings.Cancel");
}

ipcRenderer.on("PluginSettings.Initialize.hotkey-detector", (event, data) => {
  console.log("Received PluginSettings.Initialize");
  console.log(JSON.stringify(data));
  bindToForm(data);
  bindButtons();
  // ? maybe we don't need this
  // ipcRenderer.send("PluginSettings.Modify", {});
});
