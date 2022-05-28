console.log('entryEditor');

const { ipcRenderer } = require("electron");


function bindButtons() {
  var applyBtn = document.getElementById("entry-apply-btn");
  applyBtn.addEventListener("click", (event) => {
    ipcRenderer.send("Entry.Dialog.Apply", {});
  });

  var cancelBtn = document.getElementById("entry-cancel-btn");
  cancelBtn.addEventListener("click", (event) => {
    ipcRenderer.send("Entry.Dialog.Cancel");
  });
}

ipcRenderer.on("Entry.Dialog.Initialize", (event, data) => {
  console.log("Received Entry.Initialize");
  console.log(JSON.stringify(data));
  bindButtons();
});
