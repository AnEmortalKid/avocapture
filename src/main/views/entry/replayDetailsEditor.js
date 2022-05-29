const { ipcRenderer } = require("electron");

console.log('entryEditor');

const replayId = "replay.id";
const replayPrefix = "replay.prefix";
const replayTitle = "replay.title";

function bindToForm(data) {
  const { prefix, id } = data;

  document.getElementById(replayId).value = id;
  document.getElementById(replayPrefix).value = prefix;
  document.getElementById(replayTitle).focus();
}

function bindFromForm() {
  return {
    prefix: document.getElementById(replayPrefix).value,
    title: document.getElementById(replayTitle).value,
    id: document.getElementById(replayId).value
  }
}

function bindButtons() {
  var applyBtn = document.getElementById("entry-apply-btn");
  applyBtn.addEventListener("click", (event) => {
    ipcRenderer.send("ReplayDetails.Dialog.Apply", bindFromForm());
  });

  var cancelBtn = document.getElementById("entry-cancel-btn");
  cancelBtn.addEventListener("click", (event) => {
    ipcRenderer.send("ReplayDetails.Dialog.Cancel");
  });
}

ipcRenderer.on("ReplayDetails.Dialog.Initialize", (event, data) => {
  console.log("Received Entry.Initialize");
  console.log(JSON.stringify(data));
  bindToForm(data);
  bindButtons();
});
