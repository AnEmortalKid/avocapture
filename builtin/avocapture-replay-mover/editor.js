const { ipcRenderer } = require("electron");

const selectDirButton = document.getElementById('mover.replayLocation.button');
const replayFolderInput = document.getElementById('mover.replayLocation');

function submitData() {
  const data = bindFromForm();
  // TODO disable/don't apply if invalid
  ipcRenderer.send("ExtensionSettings.Apply", { settings: data });
}

function cancelForm() {
  ipcRenderer.send("ExtensionSettings.Cancel");
}

function bindToForm(data) {
  console.log('BindingToForm ', data);
  if (data) {
    replayFolderInput.value = data.destination;
  }
}

function bindFromForm() {
  return {
    destination: replayFolderInput.value
  }
}

function bindButtons() {
  var applyBtn = document.getElementById("entry-apply-btn");
  applyBtn.addEventListener("click", submitData);

  var cancelBtn = document.getElementById("entry-cancel-btn");
  cancelBtn.addEventListener("click", cancelForm);
}

selectDirButton.onclick = () => {
  ipcRenderer.send('AppActions.SelectDirectory')
};

ipcRenderer.on('AppActions.SelectDirectory.Response', (event, data) => {
  if (data) {
    replayFolderInput.value = data;
  }
});

ipcRenderer.on('ExtensionSettings.Initialize.avocapture-replay-mover', (event, data) => {
  console.log(`Received ExtensionSettings.Initialize: ${JSON.stringify(data)}`);
  bindToForm(data);
  bindButtons();
});