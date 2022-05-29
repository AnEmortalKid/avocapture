const ipcRenderer = window.require('electron').ipcRenderer;

console.log(
  '👋 This message is being logged by "renderer.js", included via webpack'
);

// todo def do this better but this worked
function settings() {
  const childWindow = window.open('', 'modal')
  childWindow.document.write('<h1>Hello</h1>')
}

document.getElementById("settings").onclick = () => settings();

ipcRenderer.on("ReplayDetails.Add", (event, data) => {
  console.log("Received ReplayDetails.Add");
  console.log(JSON.stringify(data));
  const sp = document.createElement("span");
  sp.textContent = JSON.stringify(data);
  document.getElementById("list").appendChild(sp);
});