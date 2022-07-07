const OBSWebSocket = require('obs-websocket-js').default;

async function doTheThing() {
  const obs = new OBSWebSocket();
  const hello = await obs.connect();
  console.log(hello);
  obs.on('ReplayBufferSaved', (data) => {
    console.log(data);
  });

  obs.once('ExitStarted', () => {
    console.log('OBS started shutdown');
  });
}

doTheThing();

// on initialize ->
 // attempt to connect to the obs server and establish that client

// on activate, connect
// on deactivate, off
// on modifyApply, re-initialize
// on modify