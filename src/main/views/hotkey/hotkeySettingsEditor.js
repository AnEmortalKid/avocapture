const { ipcRenderer } = require("electron");

const selectedHotkey = "hotkey.selected";

var nextHotkey = {
  vKey: '', browserName: ''
}

function bindToForm(data) {
  // TODO convert Visible Value -> Global Listener
  console.log('BindingToForm ', data);
  const input = document.getElementById(selectedHotkey);
  if (data) {
    const { vKey, browserName } = data;
    input.value = browserName;
    nextHotkey.keyCode = vKey
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
  // TODO stash in the input
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
  ipcRenderer.send("HotkeySettings.Dialog.Apply", bindFromForm());
}

function cancelForm() {
  ipcRenderer.send("HotkeySettings.Dialog.Cancel");
}

ipcRenderer.on("HotkeySettings.Dialog.Initialize", (event, data) => {
  console.log("Received HotkeySettings.Initialize");
  console.log(JSON.stringify(data));
  bindToForm(data);
  bindButtons();
  broadcastModifying();
});
