const selectDirButton = document.getElementById("mover.replayLocation.button");
const replayFolderInput = document.getElementById("mover.replayLocation");

function submitData() {
  const data = bindFromForm();
  // TODO disable/don't apply if invalid
  avocapture.extensions.applySettings(data);
}

function cancelForm() {
  avocapture.extensions.cancelSettings();
}

function bindToForm(data) {
  console.log("BindingToForm ", JSON.stringify(data));
  if (data) {
    replayFolderInput.value = data.destination;
  }
}

function bindFromForm() {
  return {
    destination: replayFolderInput.value,
  };
}

function bindButtons() {
  var applyBtn = document.getElementById("entry-apply-btn");
  applyBtn.addEventListener("click", submitData);

  var cancelBtn = document.getElementById("entry-cancel-btn");
  cancelBtn.addEventListener("click", cancelForm);
}

function setDirectory(data) {
  console.log(`Data: ${data}`)
  replayFolderInput.value = data;
}

selectDirButton.onclick = () => {
  avocapture.actions.selectDirectory(setDirectory);
};

bindButtons();

avocapture.extensions.onInitialize((data) => {
  console.log(`Received ExtensionSettings.Initialize: ${JSON.stringify(data)}`);
  bindToForm(data);
});
