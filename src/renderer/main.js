const ipcRenderer = window.require('electron').ipcRenderer;

console.log(
  '👋 This message is being logged by "renderer.js", included via webpack'
);

document.getElementById("detector.settings").onclick = () => {
  ipcRenderer.send("HotkeySettings.Initialize", {});
}

ipcRenderer.on("ReplayDetails.Add", (event, data) => {
  console.log("Received ReplayDetails.Add");
  console.log(JSON.stringify(data));

  const item = document.createElement("li");
  item.textContent = data.title
  document.getElementById("replays.list").appendChild(item);
});

ipcRenderer.on("AppSettings.Initialize", (event, data) => {
  console.log('[AppSettings.Initialize] ', data);
  const input = document.getElementById('app.prefix');
  input.value = data.prefix;

  input.addEventListener('change', (event) => {
    ipcRenderer.send('AppSettings.Apply', { prefix: event.target.value });
  });
});