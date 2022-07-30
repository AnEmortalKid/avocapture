const { ipcRenderer } = require("electron");

const msgElem = document.getElementById("message");

ipcRenderer.on("App.Initialize", (e, msg) => {
  msgElem.textContent = msg;
});
