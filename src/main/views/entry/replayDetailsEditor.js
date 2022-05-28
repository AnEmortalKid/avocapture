console.log('entryEditor');

const { ipcRenderer } = require("electron");


const replayPrefix = "replay.prefix";
const replayTitle = "replay.title";

function bindToForm(data) {
  const { prefix } = data;

  const replayPrefixInput = document.getElementById(replayPrefix);
  replayPrefixInput.value = prefix;
}

function bindFromForm() {
  return {
    prefix: document.getElementById(replayPrefix).value,
    title: document.getElementById(replayTitle).value
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
