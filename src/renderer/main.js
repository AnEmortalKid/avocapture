console.log(
  '👋 This message is being logged by "renderer.js", included via webpack'
);

// todo def do this better but this worked
function settings() {
  const childWindow = window.open('', 'modal')
  childWindow.document.write('<h1>Hello</h1>')
}

document.getElementById("settings").onclick = () => settings();