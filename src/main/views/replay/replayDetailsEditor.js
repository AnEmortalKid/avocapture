const { ipcRenderer } = require("electron");

function logOn(name, data) {
  console.log(`Received [${name}]`, data ? data : "");
}

const replayIdInput = document.getElementById('replay.uuid');
const replayPrefixInput = document.getElementById('replay.prefix');
const replayTitleInput = document.getElementById('replay.title');

function cleaner(str) {
  return str.replaceAll("\\", "")
    .replaceAll(".", "")
    .replaceAll("/", "");
}

function bindToForm(data) {
  const { prefix, replayUuid } = data;

  replayIdInput.value = replayUuid;
  replayPrefixInput.value = prefix;
  replayTitleInput.value = ""
  replayTitleInput.focus();
}

function bindFromForm() {
  const cleanTitle = cleaner(replayTitleInput.value)
  const cleanPrefix = cleaner(replayPrefixInput.value)

  return {
    prefix: cleanPrefix,
    title: cleanTitle,
    replayUuid: replayIdInput.value
  }
}

function bindButtons() {
  var applyBtn = document.getElementById("entry-apply-btn");
  applyBtn.addEventListener("click", submitData);

  var cancelBtn = document.getElementById("entry-cancel-btn");
  cancelBtn.addEventListener("click", cancelForm);
}

function submitData() {
  ipcRenderer.send("ReplayDetails.Dialog.Apply", bindFromForm());
}

function cancelForm() {
  ipcRenderer.send("ReplayDetails.Dialog.Cancel");
}

ipcRenderer.on("ReplayDetails.Dialog.Initialize", (event, data) => {
  logOn('ReplayDetails.Dialog.Initialize', data);

  bindToForm(data);
  bindButtons();
});
