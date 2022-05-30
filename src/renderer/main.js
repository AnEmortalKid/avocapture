const ipcRenderer = window.require('electron').ipcRenderer;

console.log(
  '👋 This message is being logged by "renderer.js", included via webpack'
);

document.getElementById("settings").onclick = () => {
  ipcRenderer.send("HotkeySettings.Initialize", {});
}

ipcRenderer.on("ReplayDetails.Add", (event, data) => {
  console.log("Received ReplayDetails.Add");
  console.log(JSON.stringify(data));
  const sp = document.createElement("span");
  sp.textContent = JSON.stringify(data);
  document.getElementById("list").appendChild(sp);
});

ipcRenderer.on("AppSettings.Initialize", (event, data) => {
  console.log('[AppSettings.Initialize] ', data);
  document.getElementById('app.prefix').value = data.prefix;

  // TODO on change, fire savelet to main
});