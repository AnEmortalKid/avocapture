

const portInput = document.getElementById('server.port');
const passwordInput = document.getElementById('server.password');
const reconnectInput = document.getElementById('reconnect.interval');

avocapture.onInitialize((data) => {
  // bind to form
  portInput.value = data.serverPort;
  passwordInput.value = data.serverPassword;

});

// bind from form