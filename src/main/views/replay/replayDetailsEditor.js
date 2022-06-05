const { ipcRenderer } = require("electron");

const replayId = "replay.uuid";
const replayPrefix = "replay.prefix";
const replayTitle = "replay.title";

function bindToForm(data) {
  const { prefix, replayUuid } = data;

  document.getElementById(replayId).value = replayUuid;
  document.getElementById(replayPrefix).value = prefix;
  document.getElementById(replayTitle).focus();
}

function bindFromForm() {

  // TODO clean up input
  var cleanTitle = document.getElementById(replayTitle).value
  var cleanPrefix = document.getElementById(replayPrefix).value


  return {
    prefix: document.getElementById(replayPrefix).value,
    title: document.getElementById(replayTitle).value,
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
  console.log("Received Entry.Initialize");
  console.log(JSON.stringify(data));
  bindToForm(data);
  bindButtons();
});
