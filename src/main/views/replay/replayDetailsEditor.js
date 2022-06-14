const { ipcRenderer } = require("electron");

function logOn(name, data) {
  console.log(`Received [${name}]`, data ? data : "");
}

const replayId = "replay.uuid";
const replayPrefix = "replay.prefix";
const replayTitle = "replay.title";

function cleaner(str) {
  return str.replaceAll("\\", "")
    .replaceAll(".", "")
    .replaceAll("/", "");
}

function bindToForm(data) {
  const { prefix, replayUuid } = data;

  document.getElementById(replayId).value = replayUuid;
  document.getElementById(replayPrefix).value = prefix;
  document.getElementById(replayTitle).focus();
}

function bindFromForm() {
  const cleanTitle = cleaner(document.getElementById(replayTitle).value)
  const cleanPrefix = cleaner(document.getElementById(replayPrefix).value)

  return {
    prefix: cleanPrefix,
    title: cleanTitle,
    replayUuid: document.getElementById(replayId).value
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
