const portInput = document.getElementById('server.port');
const passwordInput = document.getElementById('server.password');
const reconnectInput = document.getElementById('reconnect.interval');

function submitData() {
  const data = bindFromForm();
  // TODO disable/don't apply if invalid
  avocapture.extensions.applySettings(data);
}

function cancelForm() {
  avocapture.extensions.cancelSettings();
}

function bindFromForm() {
  return {
    serverPort: portInput.value,
    serverPassword: passwordInput.value,
    reconnectIntervalSeconds: reconnectInput.value
  };
}

function bindButtons() {
  var applyBtn = document.getElementById("entry-apply-btn");
  applyBtn.addEventListener("click", submitData);

  var cancelBtn = document.getElementById("entry-cancel-btn");
  cancelBtn.addEventListener("click", cancelForm);
}

bindButtons();

avocapture.extensions.onInitialize((data) => {
  // bind to form
  console.log(`Received ExtensionSettings.Initialize: ${JSON.stringify(data)}`);
  if (data) {
    portInput.value = data.serverPort;
    passwordInput.value = data.serverPassword;
    reconnectInput.value = data.reconnectIntervalSeconds;
  }
});