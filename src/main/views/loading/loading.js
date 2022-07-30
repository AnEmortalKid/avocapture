const { ipcRenderer } = require("electron");


const h1 = document.createElement('h1');
h1.textContent = "Loaded JS";
document.getElementById('parent').append(h1);

ipcRenderer.on("loadit", (e, data) => {

  const h1 = document.createElement('h1');
  h1.textContent = JSON.stringify(data);

  document.getElementById('parent').append(h1);
});