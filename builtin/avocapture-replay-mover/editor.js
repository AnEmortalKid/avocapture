const selectDirButton = document.getElementById('mover.replayLocation.button');
const replayFolderInput = document.getElementById('mover.replayLocation');

function submitData() {
  const data = bindFromForm();
  // TODO disable/don't apply if invalid
  // ipcRenderer.send("ExtensionSettings.Apply", { settings: data });
  window.avocapture.extensions.applySettings(data);
}

function cancelForm() {
  window.avocapture.extensions.cancelSettings();
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
  window.avocapture.actions.selectDirectory((data) => {
    replayFolderInput.value = data;
  });
};

bindButtons();

window.avocapture.extensions.onInitialize((data) => {
  console.log(`Received ExtensionSettings.Initialize: ${JSON.stringify(data)}`);
  bindToForm(data);
});

